import {join} from "node:path";
import {cp, copyFile, readdir, rm} from 'node:fs/promises';

export async function copyToFolder(projectSource: string, projectDestination: string, dependencies?: Record<string, string>): Promise<void> {
    //TODO: get package.json.dependencies to filter node_modules
    const sourceNodeModulesPath = join(projectSource, 'node_modules');
    const destinationNodeModules = join(projectDestination, 'node_modules');

    const sourcePackageJsonFile = join(projectSource, 'package.json');
    const destinationPackageJsonFile = join(projectDestination, 'package.json');

    const nodeFolders: Record<string, boolean> = {};

    await cp(sourceNodeModulesPath, destinationNodeModules, {
        recursive: true,
        dereference: true
    });

    (await readdir(destinationNodeModules, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .forEach(dir => {
            return nodeFolders[dir.name] = false;
        });

    if (dependencies) {
        const depsKeys = Object.keys(dependencies);

        if (depsKeys) {
            depsKeys.forEach((dep: string) => {
                if (dep.indexOf('/') !== -1) {
                    dep = dep.substring(0, dep.indexOf('/'));
                }

                if (nodeFolders.hasOwnProperty(dep)) {
                    nodeFolders[dep] = true;
                }
            });
        }
    }

    const removals:Promise<any>[] = [];
    Object.entries(nodeFolders).filter(x => !x[1]).forEach(key => {
        let removalPath = join(destinationNodeModules, key[0]);
        removals.push(rm(removalPath, {recursive: true}));
    });

    Promise.allSettled(removals.concat(
        copyFile(sourcePackageJsonFile, destinationPackageJsonFile)
    ));
}

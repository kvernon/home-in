import * as fs from "fs";
import archiver from 'archiver';

export function zipPackage(projectDestination: string, zipPackageName:string): void {
    const archive = archiver('zip', {
        zlib: {level: 0} // Sets the compression level.
    });

    const output = fs.createWriteStream(`${zipPackageName}.zip`);

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
        console.log('Data has been drained');
    });

// good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

// pipe archive data to the file
    archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
    archive.directory(projectDestination, false);

    archive.finalize();
}

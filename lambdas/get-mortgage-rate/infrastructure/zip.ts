import {dirname, join} from "node:path";
import {zipPackage} from "../../../infrastructure/zip";

const currentDirectory = dirname(__dirname);
const distPath = join(currentDirectory, 'dist');

import packageJson from '../package.json';

zipPackage(distPath, `${packageJson.name}-${packageJson.version}`);

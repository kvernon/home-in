import {dirname, join} from "node:path";
import {copyToFolder} from "../../../infrastructure/copyToFolder";

const currentDirectory = dirname(__dirname);
const distPath = join(currentDirectory, 'dist');

import packageJson from '../package.json';

copyToFolder(currentDirectory, distPath, packageJson.dependencies );

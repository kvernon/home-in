import {argv} from 'node:process';
import packageJson from '../package.json';
import {dirname, join} from "node:path";
import {uploadAndCreateStack} from '../../../infrastructure/aws';
import * as url from "node:url";
import {IParameterValues} from "../../../infrastructure/i-parameter-values";

const currentDirectory = dirname(__dirname);

const fileName = `${packageJson.name}-${packageJson.version}`;
const pathAndFileName = join(currentDirectory, fileName);
const pathAndFileNameUri = url.pathToFileURL(pathAndFileName).href;

console.log('fileName', fileName);
console.log('pathAndFileNameUri', pathAndFileNameUri);

const suppliedArgs: ['APIKey', 'RapidAPIKey', 'RapidAPISecret', 'S3BucketName'] = ['APIKey', 'RapidAPIKey', 'RapidAPISecret', 'S3BucketName'];
const suppliedArgsWithDash = suppliedArgs.map(x => `--${x}`);

const vars = argv.filter(a => a.indexOf('--') === 0);
if (vars.length < 3) {
    throw new Error(`Needs values for ${suppliedArgsWithDash.join(', ')}`);
}

const values: IParameterValues = {
    RapidAPISecret: '',
    RapidAPIKey: '',
    APIKey: '',
    HttpMethod: 'GET'
};

vars.forEach(x => {
    suppliedArgs.forEach(k => {
        const searchString = `--${k}=`;
        if (x.indexOf(searchString) === 0) {
            values[k] = x.replace(searchString, '');
        }
    });
});

uploadAndCreateStack({
    ...values,
    LambdaFileName: fileName,
    LambdaPathAndFileName: pathAndFileNameUri,
    LambdaName: packageJson.name
});

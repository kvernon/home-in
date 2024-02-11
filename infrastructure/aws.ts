import * as url from "node:url";
import {IParameterValuesAll, IParameterValuesCreate} from "./i-parameter-values";
import {join} from "node:path";
import promiseSpawn from '@npmcli/promise-spawn';
import {spawn} from "node:child_process";

const formatParameterKeyValue = (x: [string, string]) => `ParameterKey=${x[0]},ParameterValue=${x[1]}`;

const cubedElementApiStorage = 'cubedelement-api-storage';

export async function uploadZip(localPathAndFileName: string, s3BucketName = cubedElementApiStorage): Promise<void> {
    const allArgs = [
        's3',
        'cp',
        url.fileURLToPath(`${localPathAndFileName}.zip`),
        `s3://${s3BucketName}/`
    ];
    console.log('central aws spawn s3 args', allArgs);
    await promiseSpawn('aws', allArgs, {stdio: "inherit"});
}

export async function doesStackExist(stackName: string): Promise<boolean> {
    const allArgs = [
        'cloudformation',
        'describe-stacks',
        '--no-paginate',
        '--query',
        'Stacks[0].StackName',
        '--stack-name',
        stackName];

    return promiseSpawn('aws', allArgs, {
        stdio: "pipe",
        stdioString: true,
        shell: true
    }).then(result => {
        return result.stdout === `"${stackName}"`;
    }).catch((e) => {
        console.log('failed', e)
        return false;
    })
}

export async function createStack(keyValue: IParameterValuesCreate): Promise<void> {
    const paramsConverted = Object.entries(keyValue).map(formatParameterKeyValue);
    const templateUri = url.pathToFileURL(join(__dirname, 'cloudformation.template')).href;

    const allArgs = [
        'cloudformation',
        'create-stack',
        '--stack-name',
        keyValue.LambdaName,
        '--template-body',
        templateUri.replace("file:///", "file://"),
        '--capabilities CAPABILITY_IAM',
        '--parameters',
    ].concat(paramsConverted);

    spawn('aws', allArgs, {stdio: "inherit", shell: true});
}

async function updateStack(keyValue: IParameterValuesCreate): Promise<void> {
    const paramsConverted = Object.entries(keyValue).map(formatParameterKeyValue);
    const templateUri = url.pathToFileURL(join(__dirname, 'cloudformation.template')).href;

    const allArgs = [
        'cloudformation',
        'update-stack',
        '--stack-name',
        keyValue.LambdaName,
        '--template-body',
        templateUri.replace("file:///", "file://"),
        '--capabilities CAPABILITY_IAM',
        '--parameters',
    ].concat(paramsConverted);

    await spawn('aws', allArgs, {stdio: "inherit", shell: true});
}

export async function uploadAndCreateStack(keyValue: IParameterValuesAll): Promise<void> {
    await uploadZip(keyValue.LambdaPathAndFileName, keyValue?.S3BucketName ?? cubedElementApiStorage);

    const keyValueNoLambdaPathAndFileName: IParameterValuesCreate = {
        APIKey: keyValue.APIKey,
        HttpMethod: keyValue.HttpMethod,
        RapidAPIKey: keyValue.RapidAPIKey,
        RapidAPISecret: keyValue.RapidAPISecret,
        LambdaName: keyValue.LambdaName,
        LambdaFileName: keyValue.LambdaFileName
    };

    if (keyValue.S3BucketName) {
        keyValueNoLambdaPathAndFileName.S3BucketName = keyValue.S3BucketName;
    }

    const stackExists = await doesStackExist(keyValue.LambdaName);
    if (!stackExists) {
        await createStack(keyValueNoLambdaPathAndFileName);
        return;
    }

    await updateStack(keyValueNoLambdaPathAndFileName);
}

export interface IParameterValues {
    APIKey: string;
    RapidAPIKey: string;
    RapidAPISecret: string;
    S3BucketName?: string;
    HttpMethod: string;
}

export interface IParameterValuesCreate extends IParameterValues {
    LambdaFileName: string;
    LambdaName: string;
}

export interface IParameterValuesAll extends IParameterValuesCreate {
    LambdaPathAndFileName: string;
}

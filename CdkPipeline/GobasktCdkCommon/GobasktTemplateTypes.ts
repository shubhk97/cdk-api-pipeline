import { EndpointType, AuthorizationType, IAuthorizer, IModel,JsonSchema } from "@aws-cdk/aws-apigateway";
import {Runtime} from '@aws-cdk/aws-lambda';
import { Schema } from "inspector";
import { Aws, StackProps, Stage, StageProps } from "@aws-cdk/core";
import { Table } from "@aws-cdk/aws-dynamodb";
import { GobasktApiStack } from "./dynamic_template-stack";


export interface RequestValidators{
    validateRequestBody?:boolean,
    validateRequestParameters?:boolean
}

/**
 * Defines the Rest API
 */
export interface RestApiDefinition{
    
    
    /**
     * Name of the api 
     */
    apiName:string,
    stackName:string,
    description:string,
    type:EndpointType,
    resources: ResourceDefinition[]
    authorizerName?: string,
    cognitoUserPoolSecret?: string

}

export interface ResourceDefinition{
    id:number,
    parent:number,
    resourceName:string,
    methods?:MethodDefinition[]
}

export interface MethodDefinition{
    functionName:string,
    description?:string,
    method:string,
    operationName?:string,
    apiKeyRequired?:boolean,
    lambda:string,
    readAccessOnTabels:string[],
    writeAccessOnTables:string[]
    runtime:Runtime,
    handler:string,
    folderName:string,
    secured:boolean,
    request:RequestDefinition,
    responses:ResponseDefinition[]
}

export interface RequestDefinition{
    parameters:Parameter[],
    headers:Header[],
    models?:ModelDefinition[],
    mappingTemplates:MappingTemplate[],
    validateRequestParameters?:boolean,
    validateRequestBody?: boolean,
}

export interface ModalDefiniton{
    contentType:string,
    model:IModel
}

export interface Parameter{
    name:string,
    required:boolean
}
export interface Header{
    name:string,
    required:boolean,
    value?:string
}
export interface MappingTemplate{
    contentType:string,
    template:string
}

export interface ResponseDefinition{
      statusCode:string,
      headers:Header[],
      models?:ModelDefinition[],
      selectionPattern?:string,
      mappingTemplates:MappingTemplate[]

}

export interface ModelDefinition{
    contentType:string,
    description:string,
    modelName:string,
    schema:JsonSchema;
}
export interface gobasktProps extends StackProps {
    apiProps: RestApiDefinition,
    stageName?:string
  }


export interface PipelineProps extends StackProps{
    pipelineProps: PipelineDefiniton
    applicationProps:gobasktProps
}

export interface GobasktApiStageProps extends StageProps{
    applicationProps:gobasktProps
}

export interface PipelineDefiniton{
    applicationName:string,
    pipelineName:string,
    environments:{
        pipeline:{
            account:string,
            region:string
        },
        test:{
            account:string,
            region:string
        },
        production:{
            account:string,
            region:string
        }
    }
    gitConfiguration:{
        username:string,
        repository:string,
        secretName:string
    }
}
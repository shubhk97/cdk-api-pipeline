import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { Resource, IResource, SecretValue, Fn } from "@aws-cdk/core";
import { Z_PARTIAL_FLUSH } from "zlib";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as iam from "@aws-cdk/aws-iam";

import {
  CfnMethod,
  Method,
} from "@aws-cdk/aws-apigateway";
import * as gobaskt from "./GobasktTemplateTypes";

import { Table } from "@aws-cdk/aws-dynamodb";
import { gobasktProps } from "./GobasktTemplateTypes";



export class GobasktApiStack extends cdk.Stack {
  api: apigateway.RestApi;

  apiAuthorizer: apigateway.CfnAuthorizer;
  constructor(scope: cdk.Construct, id: string, props: gobasktProps) {
    super(scope, id, props);

    const apigw = new apigateway.RestApi(this, props.apiProps.apiName, {
      restApiName: props?.apiProps.apiName,
      endpointTypes: [apigateway.EndpointType.EDGE],
    });
    this.api = apigw;

    let resources: apigateway.Resource[] = [];

    if (props.apiProps.authorizerName !== undefined && props.apiProps.cognitoUserPoolSecret!==undefined) {
      this.setApiAuthorizer(
        props.apiProps.authorizerName,
        props.stageName
      );
    }

    for (let i = 0; i < props.apiProps.resources.length; i++) {
      if (props.apiProps.resources[i].id == 0) {
        let root = apigw.root.addResource(
          props.apiProps.resources[0].resourceName
        );
        resources.push(root);
      } else {
        let node = new apigateway.Resource(
          this,
          props.apiProps.resources[i].resourceName,
          {
            parent: resources[props.apiProps.resources[i].parent],
            pathPart: props.apiProps.resources[i].resourceName,
          }
        );

        props.apiProps.resources[i].methods?.forEach(
          (methodDefinition: gobaskt.MethodDefinition) => {
            let lambda = this.getLambda(
              methodDefinition.functionName,
              methodDefinition.runtime,
              methodDefinition.handler,
              methodDefinition.folderName
            );
            this.grantAccess(
              lambda,
              methodDefinition.readAccessOnTabels,
              methodDefinition.writeAccessOnTables
            );

            const method = node.addMethod(
              methodDefinition.method,
              this.getIntegration(methodDefinition, lambda),
              this.getMethodOptions(methodDefinition)
            );

            if (methodDefinition.secured === true) {
              this.setMethodAuthorizer(method);
            }

          
          
          }
        );

        resources.push(node);
      }
    }
  }
  setApiAuthorizer = (
    authorizerName: string,
    stageName?: String
  ) => {
    
      this.apiAuthorizer = new apigateway.CfnAuthorizer(this, authorizerName, {
      restApiId: this.api.restApiId,
      name: authorizerName,
      type: "COGNITO_USER_POOLS",
      identitySource: "method.request.header.Authorization",
      providerArns:[ Fn.importValue(stageName+"-"+"MerchantCognitoUserPool"+"PoolId")]
    });
    
  };

  getLambda = (
    functionName: string,
    runtime: lambda.Runtime,
    handler: any,
    folderName: string
  ) => {
    return new lambda.Function(this, functionName, {
      functionName: functionName,
      runtime: runtime,
      handler: handler,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../src/lambda/", folderName)
      ),
    });
  };

  grantAccess = (lambda: lambda.Function, read: string[], write: string[]) => {
    read.forEach((tableName: string) => {
      let table = Table.fromTableName(this, tableName, tableName);
      table.grantReadData(lambda);
    });
    write.forEach((tableName: string) => {
      let table = Table.fromTableName(this, tableName, tableName);
      table.grantWriteData(lambda);
    });
  };

     /**
   * Creates lambnda integration object
   */
  getIntegration = (
    method: gobaskt.MethodDefinition,
    lambdaFunction: lambda.Function
  ) => {
    return new apigateway.LambdaIntegration(
      lambdaFunction,
      this.getIntegrationOptions(method)
    );
  };

  getIntegrationOptions = (method: gobaskt.MethodDefinition) => {
    var options: apigateway.LambdaIntegrationOptions = {
      proxy: false,
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: this.getRequestTemplate(
        method.request.mappingTemplates
      ),
      integrationResponses: this.getIntegrationResponses(method),
    };
    return options;
  };

  getRequestTemplate = (templates: any) => {
    let templateMap: any = {};
    templates.forEach((template: any) => {
      templateMap[template.contentType] = template.template;
    });
    return templateMap;
  };
  
  getIntegrationResponses = (method: gobaskt.MethodDefinition) => {
    let responses: apigateway.IntegrationResponse[] = [];
    method.responses.forEach((response: gobaskt.ResponseDefinition) => {
      let resp: apigateway.IntegrationResponse = {
        statusCode: response.statusCode,
        selectionPattern:
          response.selectionPattern !== undefined
            ? response.selectionPattern
            : "",
        responseTemplates: this.getResponseTemplates(response.mappingTemplates),
        responseParameters: this.getIntegrationResponseParameters(response),
      };
      responses.push(resp);
    });
    return responses;
  };

  getResponseTemplates = (templates: gobaskt.MappingTemplate[]) => {
    let responseTemplates: any = {};
    templates.forEach((template: gobaskt.MappingTemplate) => {
      responseTemplates[template.contentType] = template.template;
    });
    return responseTemplates;
  };

  getIntegrationResponseParameters = (response: gobaskt.ResponseDefinition) => {
    let parameters: any = {};
    response.headers.forEach((header: gobaskt.Header) => {
      parameters["method.response.header." + header.name] = header.value;
    });
    return parameters;
  };

  setMethodAuthorizer(method: Method) {
    const res = method.node.findChild("Resource") as CfnMethod;
    res.addPropertyOverride("AuthorizationType", "COGNITO_USER_POOLS");
    res.addPropertyOverride("AuthorizerId", {
      Ref: this.apiAuthorizer.logicalId,
    });
  }

  getMethodOptions = (method: any) => {
    let opt: apigateway.MethodOptions = {
      operationName: method.operationName,
      authorizer: method.authorizer,
      apiKeyRequired: method.apiKeyRequired,
      methodResponses: this.getResponses(method.responses),
      requestModels: method.request.models,
    };
    return opt;
  };
  getResponses = (responses: any) => {
    let output: apigateway.MethodResponse[] = [];
    responses.forEach((response: any) => {
      output.push({
        statusCode: response.statusCode,
        responseParameters: this.getResponseParameters(response.headers),
        responseModels: this.getResponseModels(response.models),
      });
    });
    return output;
  };
  getResponseModels = (models: gobaskt.ModelDefinition[]) => {
    let outputModel: any = {};
    models.forEach((model: gobaskt.ModelDefinition) => {
      let modelObj = this.api.addModel(model.modelName, model);
      outputModel[model?.contentType] = modelObj;
    });
    return outputModel;
  };
  getResponseParameters = (headers: gobaskt.Header[]) => {
    const headerOutput: any = {};
    headers.forEach((header: gobaskt.Header) => {
      headerOutput["method.response.header." + header.name] = header.required;
    });
    return headerOutput;
  };

  getRequestValidator(
    requestBody: boolean | undefined,
    requestParam: boolean | undefined
  ): apigateway.RequestValidatorOptions {
    return {
      validateRequestBody: requestBody,
      validateRequestParameters: requestParam,
    };
  }
}

import {
  EndpointType,
  AuthorizationType,
  Model,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { PipelineDefiniton, RestApiDefinition } from "../lib/GobasktTemplateTypes";

export const pipeLineProperties: PipelineDefiniton = {
 
    applicationName: "TestApplication",
    pipelineName: "TestApplicationPipeline",
    
    environments: {
      pipeline: {
        account: "188358290424",
        region: "ap-south-1"
      },
      dev: {
        account: "188358290424",
        region: "ap-south-1"
      },
      test: {
        account: "188358290424",
        region: "ap-south-1"
      },
      production: {
        account: "188358290424",
        region: "ap-south-1"
      }
    },
    gitConfiguration: {
      username: "srnyapathi",
      repository: 'CdkPipeline',
      secretName: 'TEST'
    }
  };

export const applicationProperties: RestApiDefinition = {
  stackName: "MerchantRegistrationApi",
  apiName: "MerchantRegistration",
  description: "This is some random description that is used",
  type: EndpointType.REGIONAL,
  authorizerName: 'TestAuthorizor',
  cognitoUserPoolSecret: "COGNITO_MERCHANT_POOL",
  resources: [
    {
      id: 0,
      parent: 0,
      resourceName: "gobaskt",
    },
    {
      id: 1,
      parent: 0,
      resourceName: "signUp",
      methods: [
        {
          functionName: "MerchantRegistration-signUp-POST-py",
          description: "This method is used to register the merchants",
          method: "POST",
          lambda: "MerchantRegistration-signUp-POST-py",
          runtime: Runtime.PYTHON_3_8,
          handler: "lambda_function.lambda_handler",
          folderName: "MerchantRegistration-signUp-POST-py",
          readAccessOnTabels: ["Bpprofile"],
          writeAccessOnTables: [],
          secured: true,
          request: {
            parameters: [
              {
                name: "param1",
                required: true,
              },
            ],
            headers: [
              {
                name: "param2",
                required: true,
              },
            ],
            models: [],
            mappingTemplates: [
              {
                contentType: "application/json",
                template: `{
                              "city":"$input.params('city')",
                              "businessType":"$input.params('businessType')"
                          }`,
              },
            ],
            validateRequestParameters: true,
            validateRequestBody: true,
          },
          responses: [
            {
              statusCode: "200",
              headers: [
                {
                  name: "param2",
                  value: "'*'",
                  required: true,
                },
              ],
              models: [
                {
                  contentType: "application/json",
                  description: 'test',
                  modelName: "blank",
                  schema: {}
                }
              ],
              mappingTemplates: [
                { contentType: "application/json", template: "" },
              ],
            },
          ],
        },
      ],
    },
  ],
}


import {
  EndpointType,
  AuthorizationType,
  Model,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import {
  PipelineDefiniton,
  RestApiDefinition,
} from "../lib/GobasktTemplateTypes";

export const pipeLineProperties: PipelineDefiniton = {
  applicationName: "TestApplication",
  pipelineName: "TestApplicationPipeline",

  environments: {
    pipeline: {
      account: "777595641779",
      region: "ap-south-1",
    },
    dev: {
      account: "777595641779",
      region: "ap-south-1",
    },
    test: {
      account: "777595641779",
      region: "ap-south-1",
    },
    production: {
      account: "777595641779",
      region: "ap-south-1",
    },
  },
  gitConfiguration: {
    username: "EktaKesharwaniGobaskt",
    repository: "cdk-api-pipeline",
    secretName: "a97ad1bcc031f67b378e6ec5e138510fa07b5389",
  },
};

export const applicationProperties: RestApiDefinition = {
  stackName: "GroupPlanCDKTest",
    apiName: "GroupPlanCDKTest",
    description: "CDK Test",
    type: EndpointType.EDGE,
    authorizerName: "MerchantUserPool",
    cognitoUserPoolSecret: undefined,
    
  resources: [
    {
      id: 0,
      parent: 0,
      resourceName: "gobaskt",
    },
    {
      id: 1,
      parent: 0,
      resourceName: "groupPlan",
      methods: [
        {
          functionName: "CDK-Test-GroupPlanAPI-groupPlan-POST-py",
          description: "group plan api",
          method: "POST",
          lambda: "CDK-Test-GroupPlanAPI-groupPlan-POST-py",
          runtime: Runtime.PYTHON_3_8,
          handler: "lambda_function.lambda_handler",
          folderName: "CDK-Test-GroupPlanAPI-groupPlan-POST-py",
          readAccessOnTabels: [],
          writeAccessOnTables: ["GroupPlan"],
          secured: true,
          request: {
            parameters: [],
            headers: [],
            models: [],
            mappingTemplates: [
              {
                contentType: "application/json",
                template: `{
                  "applicableItems":$input.json('applicableItems'),
                  "companyEmailDomain":$input.json('companyEmailDomain'),
                  "companyName":$input.json('companyName'),
                  "bpId":$input.json('bpId'),
                  "discountExceptions":$input.json('discountExceptions'),
                  "discountType":$input.json('discountType'),
                  "discountValue":$input.json('discountValue'),
                  "groupPlanName":$input.json('groupPlanName'),
                  "groupPlanStatus":$input.json('groupPlanStatus'),
                  "groupPlanType":$input.json('groupPlanType'),
                  "contactPersonName":$input.json('contactPersonName'),
                  "defaultDiscountValidityPeriod":$input.json('defaultDiscountValidityPeriod'),
                  "contactPersonEmailId":$input.json('contactPersonEmailId'),
                  "contactPersonPhoneNo":$input.json('contactPersonPhoneNo'),
                  "defaultDiscountType":$input.json('defaultDiscountType'),
                  "groupPlanDesc":$input.json('groupPlanDesc'),
                  "groupSize":$input.json('groupSize'),
                  "groupStatus":$input.json('groupStatus'),
                  "planValidityStartDate":$input.json('planValidityStartDate'),
                  "offerBusinessRule":$input.json('offerBusinessRule'),
                  "cityCode":$input.json('cityCode')
                }
                `,
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
                  name: "Access-Control-Allow-Origin",
                  value: "'*'",
                  required: true,
                },
              ],
              models: [
                {
                  contentType: "application/json",
                  description: "test",
                  modelName: "blank",
                  schema: {},
                },
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
};

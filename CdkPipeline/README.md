# Prerequisites

1. Node js should be installed on the machine
2. AWS cli should be installed on the machine and access keys should be configured
3. Cdk should be installed on the machine with the below command 
		npm install -g aws-cdk
4. Vscode should be installed to create the templates in the typescript -> 

# Setting up your new project :
1. Create a folder with the API you want to create
	```sh
  	mkdir CampaignsApi
  ```
2. Initialize the CDK application with the below command 
  ```sh
    cdk init app --language=typescrip
  ```		
3. Install the following dependencies , these are required.
		Install below modules 
    ```
    @aws-cdk/aws-codepipeline
		@aws-cdk/aws-codepipeline-actions
		@aws-cdk/aws-dynamodb
		@aws-cdk/aws-s3
		@aws-cdk/core
		@aws-cdk/pipelines
    @aws-cdk/aws-lambda

    ```
			
4. Copy the common libraries into lib folder	
  - GobasktTemplateTypes.ts  
  - Cdkpipelinestack.ts
  - application.ts 
  - appdefinition.ts
  
5. We have to do the following changes 
  - Inside cdkpipeline you need to replace the class name with the pipeline name
   [ This needs to be done due to a bug in CDK]
  - Inside the cdk application folder initialize the stack 
  - Modify the appdefinition.ts to suit you needs . 
  
  1. #### GobasktTemplateTypes.ts

    This file will have all the types that are used in our gobaskt apis ,
    based on the datatypes defined here the compiler will validate. 
  2. #### cdkpipeline.ts 

    This file contains the code for defining the pipeline and its corresponding stages. 
    **Only class name should be changed according to the stack that we are building**
  3. #### application.ts
    This class is used in the cdkpipeline.ts stack , you need to create object for you application in this class 
  4. #### appdefinition.ts 
    This is file where the template of the application is defined . 
  5. #### cdk.json
    Add the below line in the file 
    ```js 
    "@aws-cdk/core:newStyleStackSynthesis": "true"
    ```

----
### Defining your application 

Application consists of 2 main sections .
- pipelines
- api

#### pipeline
```js
export const pipeLineProperties: PipelineDefiniton = {
 
    applicationName: "TestApplication",
    pipelineName: "TestApplicationPipeline",
    
    environments: {
      pipeline: {
        account: "1234561111",
        region: "ap-south-1"
      },
      dev: {
        account: "188358290424",
        region: "ap-south-1"
      },
      test: {
        account: "1258974545",
        region: "ap-south-1"
      },
      production: {
        account: "7979797979",
        region: "ap-south-1"
      }
    },
    gitConfiguration: {
      username: "srnyapathi",
      repository: 'CdkPipeline',
      secretName: 'TEST'
    }
  };
```
- Account & Region corresponds to the region where respective resources are deployed
- **dev** , **test** and **production** are stages.  *these will be referenced in the pipeline stack*
- **gitConfiguration** contains the git repo name and username and source where it can find the OAuth token . 

#### Api definition

```js
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

```
  

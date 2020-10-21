import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, Stack, StackProps, SecretValue } from '@aws-cdk/core';
import { RestApiDefinition } from '../GobasktCdkCommon/GobasktTemplateTypes';

export interface PipelineStackProps extends StackProps {
  readonly lambdaCode: lambda.CfnParametersCode[];
  readonly apiProps: RestApiDefinition;
  readonly githubToken: string;
}

export class PipelineStack extends Stack {
  constructor(app: App, id: string, props: PipelineStackProps) {
    super(app, id, props);

    const cdkBuild = new codebuild.PipelineProject(this, 'CdkBuild', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd CdkPipeline',
              'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk synth -- -o dist'
            ],
          },
        },
        artifacts: {
          'base-directory': 'CdkPipeline/dist',
          files: [
            'GroupPlanCDKTest.template.json',
          ],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
      },
    });

    // Build Lambda
    const lambdaBuild: codebuild.PipelineProject[] = []
    const lambdaBuildOutput: codepipeline.Artifact[] = []
    props.apiProps.resources.map(eachResource => {
      eachResource?.methods?.map(eachMethod => {
        lambdaBuild.push(new codebuild.PipelineProject(this, "LambdaBuild", {
          buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            artifacts: {
              "base-directory": "CdkPipeline/src/lambda/"+eachMethod.folderName,
              files: [
                "*"
              ]
            }
          }),
          environment: {
            buildImage: codebuild.LinuxBuildImage.STANDARD_4_0
          }
        }))

        lambdaBuildOutput.push(new codepipeline.Artifact('LambdaBuildOutput'))
      })
    })

    // Create Artifacts
    const sourceOutput = new codepipeline.Artifact("SrcOutput");
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');

    const buildActions: codepipeline_actions.CodeBuildAction[] = []
    lambdaBuild.map((eachLambdaBuild, index) => {
      buildActions.push(new codepipeline_actions.CodeBuildAction({
        actionName: 'Lambda_Build',
        project: eachLambdaBuild,
        input: sourceOutput,
        outputs: [lambdaBuildOutput[index]],
      }))
    })

    const parameterOverrides = []
    lambdaBuildOutput.map((eachLambdaBuildOutput, index) => {
      parameterOverrides.push(props.lambdaCode[index].assign(eachLambdaBuildOutput.s3Location))
    })

    // Complete Pipeline Project
    new codepipeline.Pipeline(this, 'Pipeline', {
      restartExecutionOnUpdate: true,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'Checkout',
              output: sourceOutput,
              owner: "shubhk97",
              repo: "cdk-api-pipeline",
              oauthToken: SecretValue.plainText(props.githubToken),
              trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            ...buildActions,
            new codepipeline_actions.CodeBuildAction({
              actionName: 'CDK_Build',
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Lambda_CFN_Deploy',
              templatePath: cdkBuildOutput.atPath('GroupPlanCDKTest.template.json'),
              stackName: 'LambdaDeploymentStack',
              adminPermissions: true,
              parameterOverrides: {
                ...props.lambdaCode[0].assign(lambdaBuildOutput[0].s3Location)
              },
              extraInputs: [...lambdaBuildOutput],
            }),
          ],
        },
      ],
    });
  }
}
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TestApplicationPipeline } from '../lib/cdk_pipeline-stack';
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { applicationProperties, pipeLineProperties} from '../bin/appdefinition';
import { GobasktApiStack } from '../lib/dynamic_template-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import * as lambda from '@aws-cdk/aws-lambda';

const app = new cdk.App();
const lambdaStack = new GobasktApiStack(app,applicationProperties.stackName,{apiProps: applicationProperties});
new PipelineStack(app, 'PipelineStack', {
    lambdaCode: lambdaStack.lambdaCode,
    githubToken: "f9491817fe0e7a5c312e54d23b8ab84169aabd37",
    env: {
      region: "ap-south-1",
    }
  });

  app.synth()
// new TestApplicationPipeline(app, pipeLineProperties.pipelineName,{
//     env: {
//       account: pipeLineProperties.environments.pipeline.account,
//       region: pipeLineProperties.environments.pipeline.region,
//     },
//     pipelineProps:pipeLineProperties,
//     applicationProps:{
//       apiProps: applicationProperties
//     }
//   });

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
// import { TestApplicationPipeline } from '../lib/cdk_pipeline-stack';
// import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { applicationProperties, pipeLineProperties} from '../bin/appdefinition';
import { GobasktApiStack } from '../lib/dynamic_template-stack';

const app = new cdk.App();
new GobasktApiStack(app,applicationProperties.stackName,{apiProps: applicationProperties});
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

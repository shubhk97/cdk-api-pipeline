#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TestApplicationPipeline } from '../lib/cdk_pipeline-stack';
import { PipelineProject } from '@aws-cdk/aws-codebuild';
import { applicationProperties, pipeLineProperties} from '../bin/appdefinition';
import { GobasktApiStack } from '../lib/dynamic_template-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new GobasktApiStack(app,applicationProperties.stackName,{apiProps: applicationProperties});

new PipelineStack(app, 'PipelineStack', {
    
    githubToken: "690d829ade9e82a28ab83991092407a533d4f493",
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

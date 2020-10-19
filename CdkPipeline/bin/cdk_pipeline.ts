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
    
    githubToken: "a97ad1bcc031f67b378e6ec5e138510fa07b5389",
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

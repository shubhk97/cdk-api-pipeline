import { Stack, StackProps, Construct, SecretValue } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";

import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Application } from "../bin/application";
import { ManualApprovalAction } from "@aws-cdk/aws-codepipeline-actions";
import { PipelineProps } from "./GobasktTemplateTypes";
import { pipeLineProperties } from "../bin/appdefinition";




export class TestApplicationPipeline extends Stack {
  constructor(scope: Construct, id: string, props: PipelineProps) {

    super(scope, id, props);
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, props?.pipelineProps.pipelineName, {
      pipelineName:props?.pipelineProps.pipelineName,
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: SecretValue.secretsManager(props.pipelineProps.gitConfiguration.secretName),
        trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
        owner: props.pipelineProps.gitConfiguration.username,
        repo: props.pipelineProps.gitConfiguration.repository,
        
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,

        // Use this if you need a build step (if you're not using ts-node
        // or if you have TypeScript Lambdas that need to be compiled).
        
        buildCommand: "npm run build",
      }),
    });

    const testStage = pipeline.addApplicationStage(
      new Application(this, "TestStage", {
        applicationProps:props.applicationProps,
        env: {
          account: props.pipelineProps.environments.test.account,
          region: props.pipelineProps.environments.test.region,
        },
      })
    );

    testStage.addActions(
      new ManualApprovalAction({
        actionName: "ManualApproval",
        runOrder: testStage.nextSequentialRunOrder(),
        
      })
    );
    pipeline.addApplicationStage(
      new Application(this, "prodStage", {
        applicationProps:props.applicationProps,
        env: {
          account: props.pipelineProps.environments.production.account,
          region: props.pipelineProps.environments.production.region,
        },
      })
    );

    // The code that defines your stack goes here
  }
}

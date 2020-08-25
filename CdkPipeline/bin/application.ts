import { Stack, Construct, StackProps, RemovalPolicy, Stage, StageProps } from "@aws-cdk/core";
import { Bucket, BucketEncryption, BlockPublicAccess } from "@aws-cdk/aws-s3";
import {TestStack} from '../lib/test-stack';
import { CdkPipeline } from "@aws-cdk/pipelines";
import { GobasktApiStack } from "../lib/dynamic_template-stack";
import { GobasktApiStageProps } from "../lib/GobasktApiStageProps";


export class Application extends Stage {
    constructor(scope: Construct, id: string, props: GobasktApiStageProps) {
      super(scope, id, props);
      new GobasktApiStack(this,props.applicationProps.apiProps.stackName,
        props.applicationProps);
    }
}
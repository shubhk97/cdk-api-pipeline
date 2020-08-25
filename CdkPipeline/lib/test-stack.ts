import { Stack, Construct, StackProps, RemovalPolicy } from "@aws-cdk/core";
import { Bucket, BucketEncryption, BlockPublicAccess } from "@aws-cdk/aws-s3";

export class TestStack extends Stack{
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        let sampleBucket = new Bucket(this, 'samplebucket', {
            versioned: false,
            bucketName: 'appbucketsrn',
            encryption: BucketEncryption.KMS_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY
        });

    }
}

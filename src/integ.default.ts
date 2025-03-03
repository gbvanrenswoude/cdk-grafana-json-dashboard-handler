import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3assets from 'aws-cdk-lib/aws-s3-deployment';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';

import { GrafanaHandler } from './index';

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

// It's nice to test, but not so nice to expose internal confidential information outside.
// Therefore, fail running the test when GRAFANA_SECRET_PARTIAL_ARN and GRAFANA_URL are not set in env
function getRequiredEnvVariable(name: string) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable needed for testing: "${name}"`);
  }
  return v;
}

const app = new cdk.App();
export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const testingVpc = ec2.Vpc.fromLookup(this, 'dataSourceTestingVpc', {
      vpcName: 'mn-vpc',
    });

    const testingPrivateSubnetID1 = ec2.Subnet.fromSubnetId(
      this,
      'dataSourceTestingPrivateSubnetID1',
      ssm.StringParameter.fromStringParameterAttributes(this, 'dataSourceSSMSubnet1', {
        parameterName: '/mn/landing-zone/vpc/subnets/private-1-id',
      }).stringValue,
    );

    const testingPrivateSubnetID2 = ec2.Subnet.fromSubnetId(
      this,
      'dataSourceTestingPrivateSubnetID2',
      ssm.StringParameter.fromStringParameterAttributes(this, 'DataSourceSSMSubnet2', {
        parameterName: '/mn/landing-zone/vpc/subnets/private-2-id',
      }).stringValue,
    );

    const testingPrivateSubnetID3 = ec2.Subnet.fromSubnetId(
      this,
      'dataSourceTestingPrivateSubnetID3',
      ssm.StringParameter.fromStringParameterAttributes(this, 'DataSourceSSMSubnet3', {
        parameterName: '/mn/landing-zone/vpc/subnets/private-3-id',
      }).stringValue,
    );

    const bucket = new s3.Bucket(this, 'pogg', {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const depner = new s3assets.BucketDeployment(this, 'pogu', {
      sources: [s3assets.Source.asset('test/dashboard')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'test/test',
    });
    // s3://teststack-pogg468d1739-1ohnfry55snbi1/test/test/test-dashboard.json

    const secret = sm.Secret.fromSecretPartialArn(
      this,
      'smLookup',
      getRequiredEnvVariable('GRAFANA_SECRET_PARTIAL_ARN'),
    );

    const holup = new GrafanaHandler(this, 'pog', {
      dashboardAppName: 'cdkConstructTest',
      grafanaPwSecret: secret,
      grafanaUrl: getRequiredEnvVariable('GRAFANA_URL'),
      bucketName: bucket.bucketName,
      objectKey: 'test/test/test-dashboard.json',
      localFilePath: 'test/dashboard/test-dashboard.json',
      vpc: testingVpc,
      vpcSubnets: {
        subnets: [testingPrivateSubnetID1, testingPrivateSubnetID2, testingPrivateSubnetID3],
      },
    });
    holup.node.addDependency(depner);
  }
}
new TestStack(app, 'testtddsstazckckk', { env });

import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import { GrafanaHandler } from './index';

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Docker Image Asset
    const z = new GrafanaHandler(this, 'gogo', {
      dashboard_app_name: 'test',
      grafana_pw: '',
      grafana_url: '',
      path_to_file: '../src/test/test-dashboard.json'
    });
  }
};
new TestStack(app, 'test-stack', { env });

import * as s3 from '@aws-cdk/aws-s3';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import { GrafanaHandler } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app);
  new GrafanaHandler(stack, 'TestStack', {
    dashboardAppName: 'test',
    grafanaPwSecret: new sm.Secret(stack, 'prr'),
    grafanaUrl: 'https://grafana-setup.domain.org',
    bucketName: new s3.Bucket(stack, 'ehhh').bucketName,
    objectKey: 'ehh/heh/test.json',
    localFilePath: 'test/dashboard/test-dashboard.json',
  });
  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::CloudFormation::CustomResource');
  // TODO implement check for no subnetting
});

// TODO
// test('create subnetted app', () => {
//   const app = new cdk.App();
//   const stack = new cdk.Stack(app);
//   new GrafanaHandler(stack, 'TestStack', {
//     dashboardAppName: 'test',
//     grafanaPw: 'test',
//     grafanaUrl: 'https://grafana-setup.domain.org',
//     pathToFile: '../src/test/test-dashboard.json',
//     vpc: 'todo',
//     vpcSubnets: [todo]
//   });
//   expect(stack).toHaveResource('AWS::Lambda::Function');
//   expect(stack).toHaveResource('AWS::CloudFormation::CustomResource');
//   expect(stack).toHaveResource('AWS::EC2::SecurityGroup')
// });

import * as cdk from '@aws-cdk/core';
import { GrafanaHandler } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app);
  new GrafanaHandler(stack, 'TestStack', {
    dashboard_app_name: 'test',
    grafana_pw: 'test',
    grafana_url: 'https://grafana-setup.domain.org',
    path_to_file: '../src/test/test-dashboard.json'
  });
  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::CloudFormation::CustomResource');
});

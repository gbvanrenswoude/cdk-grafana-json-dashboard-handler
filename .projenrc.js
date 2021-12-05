const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'gbvanrenswoude',
  authorAddress: 'gbvanrenswoude@gmail.com',
  cdkVersion: '1.134.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-grafana-json-dashboard-handler',
  repositoryUrl: 'https://github.com/gbvanrenswoude/cdk-grafana-json-dashboard-handler.git',
  gitignore: ['cdk.out', 'cdk.context.json'],
  python: {
    distName: 'cdk-grafana-json-dashboard-handler',
    module: 'cdk-grafana-json-dashboard-handler',
  },
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-kms'
  ],  
  peerDeps: [
    '@aws-cdk/aws-kms'
  ],
  // cdkTestDependencies: undefined,  /* AWS CDK modules required for testing. */
  // deps: [],                        /* Runtime dependencies of this module. */
  // description: undefined,          /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-ssm',
  ],                     /* Build dependencies for this module. */
  // packageName: undefined,          /* The "name" in package.json. */
  // release: undefined,              /* Add release management to this project. */
});
project.synth();
const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'gbvanrenswoude',
  authorAddress: 'gbvanrenswoude@gmail.com',
  cdkVersion: '1.129.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-grafana-json-dashboard-handler',
  repositoryUrl: 'https://github.com/gbvanrenswoude/cdk-grafana-json-dashboard-handler.git',
  gitignore: ['cdk.out'],
  python: {
    distName: 'cdk-grafana-json-dashboard-handler',
    module: 'cdk-grafana-json-dashboard-handler',
  },
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ssm'
  ],  
  // cdkTestDependencies: undefined,  /* AWS CDK modules required for testing. */
  // deps: [],                        /* Runtime dependencies of this module. */
  // description: undefined,          /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                     /* Build dependencies for this module. */
  // packageName: undefined,          /* The "name" in package.json. */
  // release: undefined,              /* Add release management to this project. */
});
project.synth();
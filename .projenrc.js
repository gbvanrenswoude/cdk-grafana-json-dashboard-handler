const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'gbvanrenswoude',
  eslint: false,
  gitIgnoreOptions: {
    ignorePatterns: [
      '# Devenv',
      '.devenv*',
      'devenv.local.nix',
      '',
      '# direnv',
      '.direnv',
      '',
      '# pre-commit',
      '.pre-commit-config.yaml',
    ],
  },
  authorAddress: 'gbvanrenswoude@gmail.com',
  cdkVersion: '2.181.1',
  defaultReleaseBranch: 'main',
  name: 'cdk-grafana-json-dashboard-handler',
  repositoryUrl: 'https://github.com/gbvanrenswoude/cdk-grafana-json-dashboard-handler.git',
  gitignore: ['cdk.out', 'cdk.context.json'],
  python: {
    distName: 'cdk-grafana-json-dashboard-handler',
    module: 'cdk-grafana-json-dashboard-handler',
  },
  peerDeps: ['aws-cdk-lib'],
  // cdkTestDependencies: undefined,  /* AWS CDK modules required for testing. */
  // deps: ['md5-file'],                        /* Runtime dependencies of this module. */
  bundledDeps: ['md5-file'],
  // description: undefined,          /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['aws-cdk-lib'] /* Build dependencies for this module. */,
  // packageName: undefined,          /* The "name" in package.json. */
  // release: undefined,              /* Add release management to this project. */
});

project.synth();

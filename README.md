# cdk-grafana-json-dashboard-handler

A handler Custom Construct for JSON Grafana Dashboards - Deploy to Grafana using AWSCDK.

The Construct contains a Lambda Singleton function, which gets wrapped by a CloudFormation Custom Resource.

## Grafana Handler

Implement as following:

Write your Grafana Dashboard JSON file somewhere to disk.

Use that Dashboard JSON in your stack as follows:

```ts
// setup the dependencies for the construct, for example like this
const bucket = new s3.Bucket(this, "pogg", {
  autoDeleteObjects: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new s3assets.BucketDeployment(this, "pogu", {
  sources: [s3assets.Source.asset("test/dashboard")],
  destinationBucket: bucket,
  destinationKeyPrefix: "test/test",
});

const secret = sm.Secret.fromSecretPartialArn(
  this,
  "smLookup",
  getRequiredEnvVariable("GRAFANA_SECRET_PARTIAL_ARN")
);
```

```ts
new GrafanaHandler(this, "pog", {
  dashboardAppName: "cdkConstructTest",
  grafanaPwSecret: secret,
  grafanaUrl: getRequiredEnvVariable("GRAFANA_URL"),
  bucketName: bucket.bucketName,
  objectKey: "test/test/dashboard/test-dashboard.json",
});
```

If your handler needs to live inside your projects networking tier:

```ts
new GrafanaHandler(this, "pog", {
  dashboardAppName: "cdkConstructTest",
  grafanaPwSecret: secret,
  grafanaUrl: getRequiredEnvVariable("GRAFANA_URL"),
  bucketName: bucket.bucketName,
  objectKey: "test/test/dashboard/test-dashboard.json",
  vpc: testingVpc,
  vpcSubnets: {
    subnets: [
      testingPrivateSubnetID1,
      testingPrivateSubnetID2,
      testingPrivateSubnetID3,
    ],
  },
});
```

## More permissions

Whenever your handler needs more permissions use the `addToRolePolicy` on the properties exposed on the construct:

```ts
const pog = new GrafanaHandler(this, "pog", {
  dashboardAppName: "cdkConstructTest",
  grafanaPw: process.env.pw, // pass in a string value. CDK supports resolving to string values from SSM and SecretsManager
  grafanaUrl: process.env.url,
  pathToFile: "../src/test/test-dashboard.json",
});

pog.grafanaHandlerFunction.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["ec2:*"],
    resources: ["*"],
  })
);
```

## TODO / Roadmap

1. Add custom KMS key support for the dashboard files in s3.
2. Add support for secretmanager and optional key

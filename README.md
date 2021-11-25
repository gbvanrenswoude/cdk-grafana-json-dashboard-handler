# cdk-grafana-json-dashboard-handler

A handler CR for JSON Grafana Dashboards - Deploy to Grafana using AWSCDK

## Grafana Handler

## More permissions

Whenever your handler needs more permissions use the `addToRolePolicy`

```js
this.handlerFunction.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["ec2:*"],
    resources: ["*"],
  })
);
```

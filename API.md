# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GrafanaHandler <a name="GrafanaHandler" id="cdk-grafana-json-dashboard-handler.GrafanaHandler"></a>

#### Initializers <a name="Initializers" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer"></a>

```typescript
import { GrafanaHandler } from 'cdk-grafana-json-dashboard-handler'

new GrafanaHandler(scope: Construct, id: string, props: GrafanaHandlerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps">GrafanaHandlerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps">GrafanaHandlerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.isConstruct"></a>

```typescript
import { GrafanaHandler } from 'cdk-grafana-json-dashboard-handler'

GrafanaHandler.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.property.grafanaFunctionCRHandler">grafanaFunctionCRHandler</a></code> | <code>aws-cdk-lib.CustomResource</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandler.property.grafanaHandlerFunction">grafanaHandlerFunction</a></code> | <code>aws-cdk-lib.aws_lambda.SingletonFunction</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `grafanaFunctionCRHandler`<sup>Required</sup> <a name="grafanaFunctionCRHandler" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.property.grafanaFunctionCRHandler"></a>

```typescript
public readonly grafanaFunctionCRHandler: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

---

##### `grafanaHandlerFunction`<sup>Required</sup> <a name="grafanaHandlerFunction" id="cdk-grafana-json-dashboard-handler.GrafanaHandler.property.grafanaHandlerFunction"></a>

```typescript
public readonly grafanaHandlerFunction: SingletonFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.SingletonFunction

---


## Structs <a name="Structs" id="Structs"></a>

### GrafanaHandlerProps <a name="GrafanaHandlerProps" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps"></a>

Properties for a newly created Grafana Handler Construct.

A valid Grafana dashboard JSON has an uid, id and title key in the root of the object.
We generate these based on input so static JSON files are not a problem when wanting to deploy more dynamic
but the end result is still deterministic. This is all derived from the dashboardAppName property

#### Initializer <a name="Initializer" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.Initializer"></a>

```typescript
import { GrafanaHandlerProps } from 'cdk-grafana-json-dashboard-handler'

const grafanaHandlerProps: GrafanaHandlerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the S3 bucket containing your dashboard file. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.dashboardAppName">dashboardAppName</a></code> | <code>string</code> | A unique identifier to identify this dashboard in Grafana. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaPwSecret">grafanaPwSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The secret in SecretsManager containing your Grafana password. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaUrl">grafanaUrl</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.localFilePath">localFilePath</a></code> | <code>string</code> | The path to your local dashboard file. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.objectKey">objectKey</a></code> | <code>string</code> | The object key in where you stored your dashboard file under. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaPwSecretKey">grafanaPwSecretKey</a></code> | <code>string</code> | The optional key to be looked up from your Grafana password secret in Secretsmanager. |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.kmsKey">kmsKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | *No description.* |

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the S3 bucket containing your dashboard file.

---

##### `dashboardAppName`<sup>Required</sup> <a name="dashboardAppName" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.dashboardAppName"></a>

```typescript
public readonly dashboardAppName: string;
```

- *Type:* string

A unique identifier to identify this dashboard in Grafana.

This identifier is used to set or overwrite the title, id and uid keys in the dashboard json file
The identifier should be unique!

---

##### `grafanaPwSecret`<sup>Required</sup> <a name="grafanaPwSecret" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaPwSecret"></a>

```typescript
public readonly grafanaPwSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The secret in SecretsManager containing your Grafana password.

If needed, specify an optional grafanaPwSecretKey to fetch a value for a specific JSON key in the Secret value.

---

##### `grafanaUrl`<sup>Required</sup> <a name="grafanaUrl" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaUrl"></a>

```typescript
public readonly grafanaUrl: string;
```

- *Type:* string

---

##### `localFilePath`<sup>Required</sup> <a name="localFilePath" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.localFilePath"></a>

```typescript
public readonly localFilePath: string;
```

- *Type:* string

The path to your local dashboard file.

Give it in so the Construct can calculate an MD5 hash of it. This is needed as otherwise CloudFormation would not know when to redeploy your dashboard to Grafana when it changes.

---

##### `objectKey`<sup>Required</sup> <a name="objectKey" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.objectKey"></a>

```typescript
public readonly objectKey: string;
```

- *Type:* string

The object key in where you stored your dashboard file under.

---

##### `grafanaPwSecretKey`<sup>Optional</sup> <a name="grafanaPwSecretKey" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.grafanaPwSecretKey"></a>

```typescript
public readonly grafanaPwSecretKey: string;
```

- *Type:* string

The optional key to be looked up from your Grafana password secret in Secretsmanager.

---

##### `kmsKey`<sup>Optional</sup> <a name="kmsKey" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.kmsKey"></a>

```typescript
public readonly kmsKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="cdk-grafana-json-dashboard-handler.GrafanaHandlerProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection

---




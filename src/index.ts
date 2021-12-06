import * as path from "path";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import * as kms from "@aws-cdk/aws-kms";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as cdk from "@aws-cdk/core";
/**
 * Properties for a newly created Grafana Handler Construct.
 * A valid Grafana dashboard JSON has an uid, id and title key in the root of the object.
 * We generate these based on input so static JSON files are not a problem when wanting to deploy more dynamic
 * but the end result is still deterministic. This is all derived from the dashboardAppName property
 */
export interface GrafanaHandlerProps {
  /**
   * The secret in SecretsManager containing your Grafana password. If needed, specify an optional grafanaPwSecretKey to fetch a value for a specific JSON key in the Secret value.
   */
  readonly grafanaPwSecret: sm.ISecret;
  /**
   * The optional key to be looked up from your Grafana password secret in Secretsmanager.
   */
  readonly grafanaPwSecretKey?: string;
  /**
   * The name of the S3 bucket containing your dashboard file.
   * If your dashboard lives in source control, upload it for example using cdk s3 deployment construct.
   */
  readonly bucketName: string;
  /**
   * The object key (path to your file in the s3 bucket) to your dashboard file in s3.
   * If your dashboard lives in source control, upload it for example using cdk s3 deployment construct.
   */
  readonly objectKey: string;
  /**
   * A unique identifier to identify this dashboard in Grafana.
   * This identifier is used to set or overwrite the title, id and uid keys in the dashboard json file
   * The identifier should be unique!
   */
  readonly dashboardAppName: string;
  readonly grafanaUrl: string;
  readonly timeout?: cdk.Duration;
  readonly vpcSubnets?: ec2.SubnetSelection;
  readonly vpc?: ec2.IVpc;
  readonly kmsKey?: kms.IKey;
  // TODO add support for custom KMS encryption in the function code
}

export class GrafanaHandler extends cdk.Construct {
  public readonly grafanaHandlerFunction: lambda.SingletonFunction;
  public readonly grafanaFunctionCRHandler: cdk.CustomResource;
  constructor(scope: cdk.Construct, id: string, props: GrafanaHandlerProps) {
    super(scope, id);

    let singletonFunctionProps: lambda.SingletonFunctionProps = {
      uuid: "staticuuidforgrafanahandlerfunctionjidjpvpdwd93r9",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
      handler: "handler.main",
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: props.timeout ? props.timeout : cdk.Duration.seconds(60),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          "externalRequestLayer",
          "arn:aws:lambda:eu-central-1:770693421928:layer:Klayers-python38-requests:24"
        ),
      ], // TODO move this to urllib3 in the function code, for now we use requests layer
    };

    if (props.vpcSubnets) {
      singletonFunctionProps = {
        ...singletonFunctionProps,
        ...{ vpcSubnets: props.vpcSubnets },
      };
    }
    if (props.vpc) {
      singletonFunctionProps = {
        ...singletonFunctionProps,
        ...{ vpc: props.vpc },
      };
    }

    this.grafanaHandlerFunction = new lambda.SingletonFunction(
      this,
      "grafanaHandlerFunction",
      singletonFunctionProps
    );
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["logs:*"],
        resources: ["*"],
      })
    );
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:List*", "s3:Get*"],
        resources: [`arn:aws:s3:::${props.bucketName}`],
      })
    );
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.grafanaPwSecret.secretArn],
      })
    );
    if (props.kmsKey) {
      this.grafanaHandlerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["kms:Get*", "kms:List*", "kms:Decrypt*", "kms:Describe*"],
          resources: [props.kmsKey.keyArn],
        })
      );
    }

    let secretProps = {};
    if (props.grafanaPwSecretKey) {
      secretProps = { ...{ jsonField: props.grafanaPwSecretKey } };
    }

    const pw = cdk.SecretValue.secretsManager(
      props.grafanaPwSecret.secretArn,
      secretProps
    ).toString();

    // multiple CRs must be able to call the shared singleton lambda function, so use
    // the cr properties to pass in the imageUri via event['ResourceProperties']['grafana_pw']
    this.grafanaFunctionCRHandler = new cdk.CustomResource(
      this,
      "grafanaHandlerCR",
      {
        serviceToken: this.grafanaHandlerFunction.functionArn,
        properties: {
          grafana_pw: pw,
          bucket_name: props.bucketName,
          object_key: props.objectKey,
          dashboard_app_name: props.dashboardAppName,
          grafana_url: props.grafanaUrl,
          kms_key: props.kmsKey?.keyArn ? props.kmsKey.keyArn : "None",
        },
      }
    );
  }
}

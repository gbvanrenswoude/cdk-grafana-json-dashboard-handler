import * as path from "path";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2"

/**
 * Properties for a newly created Grafana Handler Construct.
 * A valid Grafana dashboard JSON has an uid, id and title key in the root of the object. 
 * We generate these based on input so static JSON files are not a problem when wanting to deploy more dynamic
 * but the end result is still deterministic. This is all derived from the dashboardAppName property
 */
export interface GrafanaHandlerProps {
  readonly grafanaPw: string;
  readonly pathToFile: string;
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
    }

    if (props.vpcSubnets) {
      singletonFunctionProps = { ...singletonFunctionProps, ...{ vpcSubnets: props.vpcSubnets }}
    }
    if (props.vpc) {
      singletonFunctionProps = { ...singletonFunctionProps, ...{ vpc: props.vpc }}
    }

    this.grafanaHandlerFunction = new lambda.SingletonFunction(
      this,
      "grafanaHandlerFunction",
      singletonFunctionProps);
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["logs:*"],
        resources: ["*"],
      })
    );

    // multiple CRs must be able to call the shared singleton lambda function, so use
    // the cr properties to pass in the imageUri via event['ResourceProperties']['grafana_pw']
    this.grafanaFunctionCRHandler = new cdk.CustomResource(this, "scanCR", {
      serviceToken: this.grafanaHandlerFunction.functionArn,
      properties: {
        grafana_pw: props.grafanaPw,
        path_to_file: props.pathToFile,
        dashboard_app_name: props.dashboardAppName,
        grafana_url: props.grafanaUrl,
      },
    });
  }
}

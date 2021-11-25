import * as path from "path";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";

interface GrafanaHandlerProps {
  grafana_pw: string;
  path_to_file: string;
  dashboard_app_name: string;
  grafana_url: string;
  timeout?: cdk.Duration;
}

export class GrafanaHandler extends cdk.Construct {
  public readonly grafanaHandlerFunction: lambda.SingletonFunction;
  public readonly grafanaFunctionCRHandler: cdk.CustomResource;
  constructor(scope: cdk.Construct, id: string, props: GrafanaHandlerProps) {
    super(scope, id);

    this.grafanaHandlerFunction = new lambda.SingletonFunction(
      this,
      "grafanaHandlerFunction",
      {
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
        ], // TODO move this to urllib3 in the function code
      }
    );
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
        grafana_pw: props.grafana_pw,
        path_to_file: props.path_to_file,
        dashboard_app_name: props.dashboard_app_name,
        grafana_url: props.grafana_url,
      },
    });
  }
}

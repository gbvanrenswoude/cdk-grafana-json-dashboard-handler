import * as path from 'node:path';
import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import type * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import type * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

const md5File = require('md5-file');

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
   */
  readonly bucketName: string;
  /**
   * The object key in where you stored your dashboard file under
   */
  readonly objectKey: string;
  /**
   * A unique identifier to identify this dashboard in Grafana.
   * This identifier is used to set or overwrite the title, id and uid keys in the dashboard json file
   * The identifier should be unique!
   */
  readonly dashboardAppName: string;
  /**
   * The path to your local dashboard file.
   * Give it in so the Construct can calculate an MD5 hash of it. This is needed as otherwise CloudFormation would not know when to redeploy your dashboard to Grafana when it changes.
   */
  readonly localFilePath: string;
  readonly grafanaUrl: string;
  readonly timeout?: cdk.Duration;
  readonly vpcSubnets?: ec2.SubnetSelection;
  readonly vpc?: ec2.IVpc;
  readonly kmsKey?: kms.IKey;
  // TODO add support for custom KMS encryption in the function code
}

export class GrafanaHandler extends Construct {
  public readonly grafanaHandlerFunction: lambda.SingletonFunction;
  public readonly grafanaFunctionCRHandler: cdk.CustomResource;
  constructor(scope: Construct, id: string, props: GrafanaHandlerProps) {
    super(scope, id);

    let singletonFunctionProps: lambda.SingletonFunctionProps = {
      uuid: 'staticuuidforgrafanahandlerfunctionjidjpvpdwd93r9',
      runtime: lambda.Runtime.PYTHON_3_13,
      code: lambda.Code.fromAsset(path.join(__dirname, '../function')),
      handler: 'handler.main',
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: props.timeout ? props.timeout : cdk.Duration.seconds(60),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'externalRequestLayer',
          'arn:aws:lambda:eu-central-1:770693421928:layer:Klayers-python38-requests:24',
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

    this.grafanaHandlerFunction = new lambda.SingletonFunction(this, 'grafanaHandlerFunction', singletonFunctionProps);
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['logs:*'],
        resources: ['*'],
      }),
    );
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:List*', 's3:Get*'],
        resources: [`arn:aws:s3:::${props.bucketName}`, `arn:aws:s3:::${props.bucketName}/*`],
      }),
    );
    this.grafanaHandlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [props.grafanaPwSecret.secretArn, '*'],
      }),
    );
    if (props.kmsKey) {
      this.grafanaHandlerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['kms:Get*', 'kms:List*', 'kms:Decrypt*', 'kms:Describe*'],
          resources: [props.kmsKey.keyArn],
        }),
      );
    }

    let crProps = {
      grafana_pw: props.grafanaPwSecret.secretArn,
      bucket_name: props.bucketName,
      object_key: props.objectKey,
      hash: md5File.sync(props.localFilePath),
      dashboard_app_name: props.dashboardAppName,
      grafana_url: props.grafanaUrl,
    };
    if (props.grafanaPwSecretKey) {
      crProps = { ...crProps, ...{ grafana_pw_key: props.grafanaPwSecretKey } };
    }
    if (props.kmsKey) {
      crProps = { ...crProps, ...{ kms_key: props.kmsKey } };
    }

    // multiple CRs must be able to call the shared singleton lambda function, so use
    // the cr properties to pass in the imageUri via event['ResourceProperties']['grafana_pw']
    this.grafanaFunctionCRHandler = new cdk.CustomResource(this, 'grafanaHandlerCR', {
      serviceToken: this.grafanaHandlerFunction.functionArn,
      properties: crProps,
    });
  }
}

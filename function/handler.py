import json
import boto3
import requests  # TODO use urllib3 in order to ditch the lambda layer providing requests
from botocore.exceptions import ClientError


# A valid dashboard JSON has an uid, id and title. We generate these based on input, so static JSON files are not a problem
# when doing multiple deployments. This way, names only conflict when statically named in CDK
def render_payload_object(event, dashboard_file, dashboard_app_name, dashboard_uid):
    dashboard_object = json.loads(dashboard_file)
    dashboard_object['title'] = dashboard_app_name
    dashboard_object['uid'] = dashboard_uid
    dashboard_object['id'] = None

    print(f'Modified dashboard object to {json.dumps(dashboard_object)}')

    return {
        "dashboard": dashboard_object,
        "overwrite": True,
    }


def get_grafana_bearer_token(event):
    secret_name = event['ResourceProperties']['grafana_pw']
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name='eu-central-1'
    )
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e

    secret = get_secret_value_response['SecretString']

    if "grafana_pw_key" in event['ResourceProperties']:
        print('Returning grafana_pw_key from secret')
        key = event['ResourceProperties']['grafana_pw_key']
        return secret[key]
    else:
        print('Returning full secret')
        return secret


def render_headers(grafana_pw):
    print('API KEY')
    return {"Accept": "application/json", "Content-Type": "application/json",
            "Authorization": "Bearer " + grafana_pw}


def get_dashboard_file(event):
    bucket_name = event['ResourceProperties']['bucket_name']
    key = event['ResourceProperties']['object_key']
    s3 = boto3.client('s3')
    response = s3.get_object(Bucket=bucket_name,
                             Key=key)
    return response['Body'].read()


def main(event, context):
    """[main handler]
    Processes all that is needed from the event['ResourceProperties'] then handles the Delete or Update/Create RequestType.
    Expected keys in the event Dict are:

    event['ResourceProperties']['grafana_pw']
    event['ResourceProperties']['grafana_pw_key']
    event['ResourceProperties']['bucket_name']
    event['ResourceProperties']['object_key']
    event['ResourceProperties']['dashboard_app_name']
    event['ResourceProperties']['grafana_url']
    event['ResourceProperties']['kms_key'] (Not yet implemented)

    Args:
        event ([type]): [AWS Lambda Event Dict]
        context ([type]): [AWS Lambda Context Dict]
    """

    if event['RequestType'] == 'Delete':
        try:
            print('Handling Delete RequestType')
            grafana_url = event['ResourceProperties']['grafana_url']
            physical_id = event["PhysicalResourceId"]
            dashboard_app_name = event['ResourceProperties']['dashboard_app_name']
            print('Getting authentication Bearer token value from Secretsmanager')
            grafana_pw = get_grafana_bearer_token(event)
            print(
                f'Deleting {dashboard_app_name} from {grafana_url}/api/dashboards/uid/{physical_id}')
            response = requests.delete(
                f'{grafana_url}/api/dashboards/uid/{physical_id}', headers=render_headers(grafana_pw))
            print(response.text)
            sendResponse(event, context, 'SUCCESS', {}, physical_id)
        except Exception as e:
            print(e)
            responseData = {
                'Failed': f'Dashboard DELETE to {grafana_url} FAILED for {dashboard_app_name}, delete manually!'}
            sendResponse(event, context, 'SUCCESS', responseData, physical_id)
    else:
        try:
            print('Handling Create or Update RequestType')
            grafana_url = event['ResourceProperties']['grafana_url']
            dashboard_app_name = event['ResourceProperties']['dashboard_app_name']
            if len(dashboard_app_name) > 40:
                dashboard_uid = dashboard_app_name[40]
            else:
                dashboard_uid = dashboard_app_name
            payload = render_payload_object(
                event, get_dashboard_file(event), dashboard_app_name, dashboard_uid)

            print('Getting authentication Bearer token value from Secretsmanager')
            grafana_pw = get_grafana_bearer_token(event)
            print(f'Posting {dashboard_app_name} to {grafana_url}')
            response = requests.post(
                f'{grafana_url}/api/dashboards/db', headers=render_headers(grafana_pw), json=payload)
            print(response.text)
            print(f'Posted {dashboard_app_name} to {grafana_url}')
            sendResponse(event, context, 'SUCCESS', {}, dashboard_app_name)
        except Exception as e:
            print(e)
            responseData = {
                'Failed': f'Dashboard POST to {grafana_url} for {dashboard_app_name}'}
            sendResponse(event, context, 'FAILED',
                         responseData, dashboard_uid)


def sendResponse(event, context, responseStatus, responseData, id):
    responseBody = {
        'Status': responseStatus,
        'Reason': 'See the details in CloudWatch Log Stream: ' + context.log_stream_name,
        'PhysicalResourceId': id,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'Data': responseData
    }
    try:
        print(f'Sending response to CF: {responseBody}')
        response = requests.put(
            event['ResponseURL'], data=json.dumps(responseBody))
        if response.status_code != 200:
            print(response.text)
            raise Exception(
                f'Received non 200 response while sending response to CF Stack. We did try sending: {responseBody}')
        return
    except Exception as e:
        print(e)
        raise

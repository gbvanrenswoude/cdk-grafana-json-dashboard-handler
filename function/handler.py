import json
import requests  # TODO use urllib3 in order to ditch the lambda layer providing requests


# A valid dashboard JSON has an uid, id and title. We generate these based on input, so static JSON files are not a problem
# when doing multiple deployments. This way, names only conflict when statically named in CDK
def render_payload_object(event, dashboard_file, dashboard_app_name):
    dashboard_object = json.loads(dashboard_file)
    dashboard_object['title'] = dashboard_app_name
    if len(dashboard_app_name) > 40:
        dashboard_name = dashboard_app_name[40]
    else:
        dashboard_name = dashboard_app_name
    dashboard_object['uid'] = dashboard_name
    dashboard_object['id'] = None

    print(f'Modified dashboard object to {json.dumps(dashboard_object)}')

    return {
        "dashboard": dashboard_object,
        "overwrite": True,
    }


def main(event, context):
    # Process all we need from the event['ResourceProperties'], which is
    # event['ResourceProperties']['grafana_pw']
    # event['ResourceProperties']['path_to_file']
    # event['ResourceProperties']['dashboard_app_name']
    # event['ResourceProperties']['grafana_url']
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json",
                   "Authorization": "Bearer " + event['ResourceProperties']['grafana_pw']}
        print('Set headers')
        grafana_url = event['ResourceProperties']['grafana_url']
        print(f'Set target to: {grafana_url}')

        print(f'Loading in dashboard JSON file')
        dashboard_json_path = event['ResourceProperties']['path_to_file']
        with open(dashboard_json_path) as file:
            dashboard_file = file.read()

        dashboard_app_name = event['ResourceProperties']['dashboard_app_name']
    except Exception as e:
        print(e)
        responseData = {
            'Failed': f'Dashboard pre-processing for {grafana_url}. Check if the properties specified are correct'}
        sendResponse(event, context, 'FAILED', responseData,
                     physical_id=event["PhysicalResourceId"])

    # Handle the Event RequestType
    if event['RequestType'] == 'Delete':
        try:
            physical_id = event["PhysicalResourceId"]
            print(
                f'Deleting {dashboard_app_name} from {grafana_url}/api/dashboards/uid/{physical_id}')
            payload = render_payload_object(
                event, dashboard_file, dashboard_app_name)
            response = requests.delete(
                f'{grafana_url}/api/dashboards/uid/{physical_id}', headers=headers, json=payload)
            print(response.text)
            sendResponse(event, context, 'SUCCESS', {}, physical_id)
        except Exception as e:
            print(e)
            responseData = {
                'Failed': f'Dashboard POST to {grafana_url} for {dashboard_app_name}'}
            sendResponse(event, context, 'FAILED', responseData, physical_id)
    else:
        try:

            print(f'Posting {dashboard_app_name} to {grafana_url}')
            payload = render_payload_object(
                event, dashboard_file, dashboard_app_name)
            response = requests.post(
                f'{grafana_url}/api/dashboards/db', headers=headers, json=payload)
            print(response.text)
            sendResponse(event, context, 'SUCCESS', {}, dashboard_app_name)
        except Exception as e:
            print(e)
            responseData = {
                'Failed': f'Dashboard POST to {grafana_url} for {dashboard_app_name}'}
            sendResponse(event, context, 'FAILED',
                         responseData, dashboard_app_name)


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

import boto3
import os

ddb = boto3.resource("dynamodb")
table = ddb.Table(os.environ["TABLE_NAME"])

def lambda_handler(event, context):
    response = table.scan(Limit=20)
    items = response.get("Items", [])
    items.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "statusCode": 200,
        "body": items
    }

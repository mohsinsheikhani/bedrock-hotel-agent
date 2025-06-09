import boto3

dynamodb = boto3.client('dynamodb')

items = [
    {"date": "2025-12-25", "gardenView": 0, "seaView": 0},
    {"date": "2025-12-26", "gardenView": 8, "seaView": 8},
    {"date": "2025-12-27", "gardenView": 10, "seaView": 4},
    {"date": "2025-12-28", "gardenView": 7, "seaView": 8},
    {"date": "2025-12-29", "gardenView": 4, "seaView": 10},
    {"date": "2025-12-30", "gardenView": 8, "seaView": 7},
]

table_name = "HotelRoomAvailabilityTable"

for item in items:
    response = dynamodb.put_item(
        TableName=table_name,
        Item={
            "date": {"S": item["date"]},
            "gardenView": {"N": str(item["gardenView"])},
            "seaView": {"N": str(item["seaView"])}
        }
    )
    print(f"Inserted: {item['date']} - StatusCode: {response['ResponseMetadata']['HTTPStatusCode']}")

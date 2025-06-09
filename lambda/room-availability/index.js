import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log(`The user input is ${JSON.stringify(event)}`);

  // Extract user input date
  const userInputDate = event.parameters[0].value;

  // Get item from DynamoDB
  const command = new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      date: { S: userInputDate },
    },
  });

  let roomInventoryData;
  try {
    const response = await client.send(command);
    roomInventoryData = response.Item;

    console.log(roomInventoryData);
  } catch (error) {
    console.error("Error fetching item from DynamoDB:", error);
    throw error;
  }

  // Prepare response for Bedrock Agent Action Group
  const responseBody = {
    "application/json": {
      body: JSON.stringify(roomInventoryData),
    },
  };

  console.log(`The response to agent is ${JSON.stringify(responseBody)}`);

  const actionResponse = {
    actionGroup: event.actionGroup,
    apiPath: event.apiPath,
    httpMethod: event.httpMethod,
    httpStatusCode: 200,
    responseBody,
  };

  const apiResponse = {
    messageVersion: "1.0",
    response: actionResponse,
    sessionAttributes: event.sessionAttributes,
    promptSessionAttributes: event.promptSessionAttributes,
  };

  console.log(`The final response is ${JSON.stringify(apiResponse)}`);
  return apiResponse;
};

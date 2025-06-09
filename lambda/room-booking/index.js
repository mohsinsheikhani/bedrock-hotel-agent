import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});

export const handler = async (event) => {
  console.log("The user input from Agent is", JSON.stringify(event));

  const inputData = event.requestBody.content["application/json"].properties;

  let guestName, checkInDate, numberofNights, roomType;

  for (const item of inputData) {
    if (item.name === "guestName") guestName = item.value;
    if (item.name === "checkInDate") checkInDate = item.value;
    if (item.name === "numberofNights") numberofNights = item.value;
    if (item.name === "roomType") roomType = item.value;
  }

  console.log("Guest Name:", guestName);

  // Fetch room availability
  const getCommand = new GetItemCommand({
    TableName: process.env.ROOM_AVAILABILITY_TABLE,
    Key: {
      date: { S: checkInDate },
    },
  });

  let roomInventoryData;
  try {
    const response = await client.send(getCommand);
    roomInventoryData = response.Item;
    console.log("Room Inventory Data:", roomInventoryData);
  } catch (err) {
    console.error("Error fetching room inventory:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }

  const currentGardenViewInventory = parseInt(
    roomInventoryData.gardenView.N,
    10
  );
  const currentSeaViewInventory = parseInt(roomInventoryData.seaView.N, 10);

  console.log(`Garden view inventory: ${currentGardenViewInventory}`);
  console.log(`Sea view inventory: ${currentSeaViewInventory}`);

  if (currentGardenViewInventory === 0 && currentSeaViewInventory === 0) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({
        error: "No rooms available for the specified date",
      }),
    };
    console.log(response);
    return response;
  }

  // Create booking
  const bookingId = uuidv4();

  const putCommand = new PutItemCommand({
    TableName: process.env.ROOM_BOOKING_TABLE,
    Item: {
      bookingId: { S: bookingId },
      checkInDate: { S: checkInDate },
      roomType: { S: roomType },
      guestName: { S: guestName },
      numberofNights: { S: numberofNights },
    },
  });

  try {
    await client.send(putCommand);
    console.log(`Booking created with ID: ${bookingId}`);
  } catch (err) {
    console.error("Error saving booking:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error saving booking" }),
    };
  }

  // Prepare response for Bedrock Agent
  const responseBody = {
    "application/json": {
      body: JSON.stringify(bookingId),
    },
  };

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

  return apiResponse;
};

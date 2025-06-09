import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class HotelBookingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Bucket(this, "S3Bucket", {
      bucketName: "agent-kb-assets",
      versioned: true,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const roomAvailabilityTable = new dynamodb.Table(
      this,
      "HotelRoomAvailabilityTable",
      {
        tableName: "HotelRoomAvailabilityTable",
        partitionKey: {
          name: "date",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        encryption: dynamodb.TableEncryption.AWS_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // Room Availability Handler
    const roomAvailabilityHandlerProps: NodejsFunctionProps = {
      functionName: "RoomAvailabilityHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      memorySize: 128,
      entry: path.join(__dirname, "../lambda/room-availability/index.js"),
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: roomAvailabilityTable.tableName,
      },
    };

    const roomAvailabilityHandler = new NodejsFunction(
      this,
      "RoomAvailabilityHandler",
      {
        ...roomAvailabilityHandlerProps,
      }
    );

    roomAvailabilityHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:GetItem"],
        resources: [roomAvailabilityTable.tableArn],
      })
    );

    // Room Booking
    const roomBookingTable = new dynamodb.Table(this, "HotelRoomBookingTable", {
      tableName: "HotelRoomBookingTable",
      partitionKey: {
        name: "bookingId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Handler
    const hotelRoomBookingHandlerProps: NodejsFunctionProps = {
      functionName: "HotelRoomBookingHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      memorySize: 128,
      entry: path.join(__dirname, "../lambda/room-booking/index.js"),
      timeout: cdk.Duration.seconds(10),
      environment: {
        ROOM_AVAILABILITY_TABLE: roomAvailabilityTable.tableName,
        ROOM_BOOKING_TABLE: roomBookingTable.tableName,
      },
    };

    const hotelRoomBookingHandler = new NodejsFunction(
      this,
      "HotelRoomBookingHandler",
      {
        ...hotelRoomBookingHandlerProps,
      }
    );

    hotelRoomBookingHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:GetItem"],
        resources: [roomAvailabilityTable.tableArn],
      })
    );

    hotelRoomBookingHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [roomBookingTable.tableArn],
      })
    );
  }
}

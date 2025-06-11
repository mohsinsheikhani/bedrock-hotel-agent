# Bedrock Agent for Hotel Booking - AI Assistant with Tools, Action Groups & RAG with Knowledge Bases

This project simulates how hotel chains can offer smarter, AI-powered booking experiences using Amazon Bedrock Agents.

![Hotel Booking Amazon Bedrock Agent Architecture](https://github.com/user-attachments/assets/6a5e7bf3-033c-41e3-b22a-502366000bb8)


Built with Claude, Knowledge Bases, and Lambda-based Action Groups, this assistant can:
- Respond to queries about different types of rooms
- Check room availability for specific dates
- Book the selected room for the user

This mirrors how real-world hospitality companies are integrating conversational AI to reduce support load and improve bookings, with backend automation and retrieval-augmented generation (RAG).

## What the Agent Can Do
| User Request | Tool/Action Used | Backend Resource |
|--------------|------------------|------------------|
| "What types of hotel rooms do you have?" | Bedrock Knowledge Base (RAG) | Hotel details PDF in S3 |
| "Is the sea-facing room available this weekend?" | Action Group 1 (Lambda) | Room Inventory Table in DynamoDB |
| "Book it for me" | Action Group 2 (Lambda) | Booking Table in DynamoDB |

This Bedrock Agent uses a combination of LLM reasoning, RAG, and real-time actions:

### Components Description

### 1. Bedrock Knowledge Base (RAG)
- **Purpose**: Handles general inquiries about hotel room types
- **Data Source**: Hotel details stored as PDF in Amazon S3
- **Technology**: Uses Retrieval-Augmented Generation (RAG) model

### 2. Action Group 1 (Lambda)
- **Purpose**: Checks room availability
- **Data Source**: Room Inventory Table in DynamoDB
- **Functionality**: Verifies availability of specific room types for requested dates

### 3. Action Group 2 (Lambda)
- **Purpose**: Processes booking requests
- **Data Source**: Booking Table in DynamoDB
- **Functionality**: Creates and manages booking records

### 4. Data Storage

- **Amazon S3**: Stores static hotel information documents (PDF format)
- **DynamoDB**:
  - Room Inventory Table: Tracks available rooms and their attributes
  - Booking Table: Maintains reservation records

## What’s Provisioned via AWS CDK
| Resource            | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| 2 DynamoDB Tables   | One for availability lookup, one for confirmed bookings                |
| 2 Lambda Functions  | Used as Bedrock Agent tools (defined via OpenAPI)                      |
| S3 Bucket           | Stores hotel room descriptions (PDF format) used for retrieval         |
| AWS IAM Roles & Policies | Give Lambdas access to DynamoDB, S3                                 |

## How the Rest Was Set Up
Everything Bedrock-related agent creation, knowledge base setup, tool registration, and OpenAPI integration was done manually via the AWS Console.
You’ll find a full walkthrough of that process in this article

## Deploying the Infra
```
git clone https://github.com/mohsinsheikhani/bedrock-hotel-booking-agent.git
cd bedrock-hotel-booking-agent
npm install
cdk deploy
```

Once deployed:
- Upload your hotel PDF into the hotel-assets bucket
- Go to the AWS Console to configure the agent, tools, and actions


## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | Hands-on Cloud Architect | AWS Community Builder | Serverless | Infrastructure as Code (IaC) | Systems Design | Event-Driven Designs | GenAI | Agentic AI | Bedrock Agents | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**

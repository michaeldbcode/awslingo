// terraform/lambda/validate_user.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { username } = body;
    const ip = event.requestContext.identity.sourceIp;

    // Basic validation
    if (!username || username.trim().length < 3) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Username must be at least 3 characters"
        })
      };
    }

    // Check for existing attempts from this IP
    const existingAttemptsCommand = new QueryCommand({
      TableName: process.env.ATTEMPTS_TABLE,
      KeyConditionExpression: 'ip_address = :ip',
      ExpressionAttributeValues: {
        ':ip': ip
      }
    });

    const existingAttempts = await docClient.send(existingAttemptsCommand);
    console.log('Existing attempts:', JSON.stringify(existingAttempts, null, 2));

    if (existingAttempts.Items && existingAttempts.Items.length > 0) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "You have already attempted the quiz"
        })
      };
    }

    // Check if username is already taken
    const existingUsernameCommand = new ScanCommand({
      TableName: process.env.ATTEMPTS_TABLE,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    });

    const existingUsername = await docClient.send(existingUsernameCommand);
    console.log('Existing username:', JSON.stringify(existingUsername, null, 2));

    if (existingUsername.Items && existingUsername.Items.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "This username is already taken"
        })
      };
    }

    // Store the attempt
    const putCommand = new PutCommand({
      TableName: process.env.ATTEMPTS_TABLE,
      Item: {
        ip_address: ip,
        username: username,
        attempt_timestamp: Date.now()
      }
    });

    await docClient.send(putCommand);
    console.log('Stored new attempt');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        valid: true,
        message: "Username validated successfully",
        username: username
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error"
      })
    };
  }
};
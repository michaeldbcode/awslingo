// terraform/lambda/submit_quiz.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

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
    
    const { username, correctAnswers, totalTime } = body;

    // Validate input
    if (!username || typeof correctAnswers !== 'number' || typeof totalTime !== 'number') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid input parameters"
        })
      };
    }

    const putCommand = new PutCommand({
      TableName: process.env.RESULTS_TABLE,
      Item: {
        username: username,
        score: correctAnswers,
        completion_time: totalTime,
        timestamp: Date.now()
      }
    });
    
    await docClient.send(putCommand);
    console.log('Stored quiz result');

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Quiz result recorded successfully"
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
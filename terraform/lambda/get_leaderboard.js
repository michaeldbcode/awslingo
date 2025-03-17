// terraform/lambda/get_leaderboard.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    console.log('Scanning DynamoDB table:', process.env.RESULTS_TABLE);
    
    const command = new ScanCommand({
      TableName: process.env.RESULTS_TABLE
    });
    
    const results = await docClient.send(command);
    console.log('DynamoDB results:', JSON.stringify(results, null, 2));

    // Sort results by score (highest first) and then by completion time (lowest first)
    const sortedResults = (results.Items || [])
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.completion_time - b.completion_time;
      });

    console.log('Sorted results:', JSON.stringify(sortedResults, null, 2));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        leaderboard: sortedResults
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        leaderboard: []
      })
    };
  }
};
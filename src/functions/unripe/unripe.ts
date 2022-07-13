import { Handler } from "@netlify/functions";
const unripe = require("./unripe.json");

const handler: Handler = async (event, context) => {
  const account = event.queryStringParameters?.['account']?.toLowerCase();
  if (!account) {
    return {
      statusCode: 400,
      body: 'Account parameter required',
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(unripe[account] || {}),
  };
};

export { handler };
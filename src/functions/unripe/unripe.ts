import { Handler } from '@netlify/functions';

const unripe = require('./unripe.json');

/**
 * Lookup Unripe Bean and Unripe LP count for the provided `account`.
 */
const handler: Handler = async (event) => {
  const account = event.queryStringParameters?.account?.toLowerCase();
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

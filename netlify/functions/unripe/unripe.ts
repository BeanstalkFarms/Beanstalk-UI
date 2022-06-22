import { Handler } from "@netlify/functions";
import fs from "fs";
import path from "path";
const unripe = require("./unripe.json");

// const loc = path.join(__dirname, "unripe.json");
// const unripe = JSON.parse(fs.readFileSync(loc, 'utf8'));

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
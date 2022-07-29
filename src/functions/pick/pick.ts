import { Handler } from '@netlify/functions';

const unripeBean     = require('./unripe-beans-merkle.json');
const unripeBean3CRV = require('./unripe-bean3crv-merkle.json');

export type MerkleRoot = {
  amount: string;
  leaf: string;
  proof: string[];
}

export type PickMerkleResponse = {
  bean: MerkleRoot | null;
  bean3crv: MerkleRoot | null;
}

const handler : Handler = async (event, context) => {
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
    body: JSON.stringify({
      bean: unripeBean[account] || null,
      bean3crv: unripeBean3CRV[account] || null,
    }),
  };
};

export { handler };

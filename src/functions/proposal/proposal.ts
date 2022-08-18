import { Handler } from '@netlify/functions';
import * as fs from 'fs';
import path from 'path';

// const proposal = require('./bips/bip-0.md');

const handler: Handler = async (event, context) => {
  try {
    const proposal = await new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, './bips/bip-0.md'), 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });

    if (!proposal) {
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposal),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 403,
    };
  }
};

export { handler };

import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
import { ChainableFunctionResult } from 'lib/Beanstalk/Farm';
import client from './Client';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);

export async function getBlockTimestamp(blockNumber: any) {
  return (await client.provider.getBlock(blockNumber)).timestamp;
}

import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
import client from './wagmi';

// import web3 from 'web3';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);
export const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export async function getBlockTimestamp(blockNumber: any) {
  return (await client.provider.getBlock(blockNumber)).timestamp;
}

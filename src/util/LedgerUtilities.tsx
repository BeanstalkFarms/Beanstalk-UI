import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
// import web3 from 'web3';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);
export const MAX_UINT256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// export async function getBlockTimestamp(blockNumber: any) {
//   return (await web3.eth.getBlock(blockNumber)).timestamp;
// }
// TODO: run
// yarn remove web3

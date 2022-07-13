import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
import client from './Client';
import type Token from 'classes/Token';
import { ChainConstant, SupportedChainId } from 'constants/index';
import { toTokenUnitsBN } from './Tokens';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);

export async function getBlockTimestamp(blockNumber: any) {
  return (await client.provider.getBlock(blockNumber)).timestamp;
}

// -------------------------
// Chain Result Helpers
// -------------------------

export const tokenResult = (_token: Token | ChainConstant<Token>) => {
  // If a mapping is provided, default to MAINNET decimals.
  // ASSUMPTION: the number of decimals are the same across all chains.
  const token = (_token as Token).decimals 
    ? (_token as Token)
    : (_token as ChainConstant<Token>)[SupportedChainId.MAINNET]
  return (result: any) => toTokenUnitsBN(
    bigNumberResult(result),
    token.decimals
  );
};

import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import { toTokenUnitsBN } from './TokenUtilities';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);
export const tokenResult = (token: Token) => (result: any) =>
  toTokenUnitsBN(
    bigNumberResult(result),
    token.decimals
  );

import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';

import { TokenOrTokenMap } from 'constants/v2';
import { SupportedChainId } from 'constants/chains';
import { toTokenUnitsBN } from './TokenUtilities';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);
export const tokenResult = (_token: TokenOrTokenMap) => {
  // if a mapping is provided, default to mainnet's decimals
  // assume number of decimals are the same across all chains
  const token = _token instanceof Token ? _token : _token[SupportedChainId.MAINNET];
  return (result: any) => toTokenUnitsBN(
    bigNumberResult(result),
    token.decimals
  );
};

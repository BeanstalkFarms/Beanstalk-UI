import { BigNumber as BNJS } from 'ethers';
import BigNumber from 'bignumber.js';

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result instanceof BNJS ? result.toString() : result);

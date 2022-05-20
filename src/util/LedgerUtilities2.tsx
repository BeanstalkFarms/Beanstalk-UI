import BigNumber from "bignumber.js";
import { Token } from "classes";
import { toTokenUnitsBN } from "./TokenUtilities";

export const identityResult = (result: any) => result;
export const bigNumberResult = (result: any) => new BigNumber(result);
export const tokenResult = (token: Token) => (result: BigNumber.Value) =>
  toTokenUnitsBN(new BigNumber(result), token.decimals);
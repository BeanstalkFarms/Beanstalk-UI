import BigNumber from "bignumber.js";
import Token from "classes/Token";

export type FormTokenState = {
  token: Token;
  amount?: BigNumber;
  amountOut?: BigNumber;
  quoting?: boolean;
}
import BigNumber from 'bignumber.js';
import Token from 'classes/Token';

export type FormTokenState = {
  token: Token;
  amount?: BigNumber;
  amountOut?: BigNumber;
  quoting?: boolean;
}

export type FormApprovingState = {
  contract: string;
  token: Token;
  amount: BigNumber;
}

export type FormState = {
  tokens: FormTokenState[];
  approving?: FormApprovingState; 
}

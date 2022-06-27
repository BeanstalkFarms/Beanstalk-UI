import BigNumber from 'bignumber.js';
import Token from 'classes/Token';
import { ChainableFunctionResult } from 'lib/Beanstalk/Farm';

export type FormTokenState = {
  /** */
  token: Token;
  /** */
  amount: BigNumber | null;
  /** */
  quoting?: boolean;
  /** */
  amountOut?: BigNumber;
  /** */
  steps?: ChainableFunctionResult[];
}

export type FormApprovingState = {
  /** */
  contract: string;
  /** */
  token: Token;
  /** */
  amount: BigNumber;
}

export type FormState = {
  /** */
  tokens: FormTokenState[];
  /** */
  approving?: FormApprovingState; 
}

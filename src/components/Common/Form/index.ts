import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import { ChainableFunctionResult } from 'lib/Beanstalk/Farm';

export type FormState = {
  /** */
  tokens: FormTokenState[];
  /** */
  approving?: FormApprovingState; 
}

export type FormTokenState = {
  /** */
  token: ERC20Token | NativeToken;
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
  token: ERC20Token | NativeToken;
  /** */
  amount: BigNumber;
}

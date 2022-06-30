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

export { default as SettingSwitch } from './SettingSwitch';
export { default as SettingInput } from './SettingInput';
export { default as SmartSubmitButton } from './SmartSubmitButton';
export { default as TokenAdornment } from './TokenAdornment';
export { default as TokenInputField } from './TokenInputField';
export { default as TokenOutputField } from './TokenOutputField';
export { default as TokenQuoteProvider } from './TokenQuoteProvider';
export { default as TokenSelectDialog } from './TokenSelectDialog';
export { default as TxnPreview } from './TxnPreview';
export { default as TxnSeparator } from './TxnSeparator';
export { default as TxnSettings } from './TxnSettings';

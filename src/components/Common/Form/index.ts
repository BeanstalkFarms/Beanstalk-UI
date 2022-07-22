import BigNumber from 'bignumber.js';
import { ERC20Token, NativeToken } from 'classes/Token';
import { ChainableFunctionResult } from 'lib/Beanstalk/Farm';

/**
 * 
 */
export type FormState = {
  /** */
  tokens: FormTokenState[];
  /** */
  approving?: FormApprovingState; 
}

export type FormStateWithPlotSelect = FormState & {
  plot?: BigNumber;
}

/**
 * Fragment: A single Token stored within a form.
 */
export type FormTokenState = {
  /** The selected token. */
  token: ERC20Token | NativeToken;
  /**
   * The amount of the selected token, usually input by the user.
   * @value undefined if the input is empty
   */
  amount: BigNumber | undefined;
  /** Whether we're looking up a quoted `amountOut` for this token. */
  quoting?: boolean;
  /** Some `amountOut` received for inputting `amount` of this token into a function. */
  amountOut?: BigNumber;
  /** The steps needed to convert `amount` -> `amountOut`. */
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

export type PlotFragment = {
  /** The absolute index of the plot */
  index:  string | null;
  /** The user's selected start position */
  start:  BigNumber | null;
  /** The user's selected end position */
  end:    BigNumber | null;
  /** end - start  */
  amount: BigNumber | null;
}
export type PlotSettingsFragment = {
  showRangeSelect: boolean;
}

// ----------------------------------------------------------------------

// Settings
export { default as SettingSwitch } from './SettingSwitch';
export { default as SettingInput } from './SettingInput';
export { default as SmartSubmitButton } from './SmartSubmitButton';

// Fields
export { default as TokenQuoteProvider } from './TokenQuoteProvider';
export { default as TokenInputField } from './TokenInputField';
export { default as TokenOutputField } from './TokenOutputField';
export { default as TokenAdornment } from './TokenAdornment';
export { default as RadioCardField } from './RadioCardField';

// Dialogs
export { default as TokenSelectDialog } from './TokenSelectDialog';

// Modules
export { default as TxnPreview } from './TxnPreview';
export { default as TxnSeparator } from './TxnSeparator';
export { default as TxnSettings } from './TxnSettings';

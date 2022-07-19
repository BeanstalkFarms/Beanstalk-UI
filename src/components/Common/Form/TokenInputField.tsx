import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN, displayTokenAmount } from 'util/index';
import Token from 'classes/Token';
import { FarmerBalances } from 'state/farmer/balances';
import NumberFormatInput from './NumberFormatInput';
import FieldWrapper from './FieldWrapper';

export type TokenInputCustomProps = {
  /**
   * If provided, the Balance is displayed with respect
   * to this token's displayDecimals.
   */
  token?: Token;
  /**
   *
   */
  balance?: FarmerBalances[string] | BigNumber | undefined;
  /**
   *
   */
  balanceLabel?: string;
  /**
   * 
   */
  max?: BigNumber | 'use-balance';
  /**
   *
   */
  hideBalance?: boolean;
  /**
   *
   */
  quote?: JSX.Element;
  /**
   *
   */
  handleChange?: (finalValue: BigNumber | null) => void;
};

export type TokenInputProps = (
  TokenInputCustomProps // custom
  & Partial<TextFieldProps>  // MUI TextField
);

export const VALID_INPUTS = /[0-9]*/;

const TokenInput: React.FC<
  TokenInputProps & FieldProps
> = ({
  /// Balances
  token,
  balance: _balance,
  balanceLabel = 'Balance',
  hideBalance = false,
  quote,
  max: _max = 'use-balance',
  /// Formik props
  field,
  form,
  /// TextField props
  handleChange: _handleChange,
  placeholder,
  disabled,
  sx,
  InputProps,
  label,
  ...textFieldProps
}) => {
  const [displayAmount, setDisplayAmount] = useState<string>(field.value?.toString() || '');
  const inputProps = useMemo(() => ({
    inputProps: {
      min: 0.00,
      inputMode: 'numeric',
    },
    inputComponent: NumberFormatInput as any,
    ...InputProps,
  } as TextFieldProps['InputProps']), [InputProps]);

  // Unpack balance
  const [balance, balanceTooltip] = useMemo(() => {
    if (!_balance) return [undefined, ''];
    if (_balance instanceof BigNumber) return [_balance, ''];
    return [_balance.total, (
      <>
        Farm Balance: {token ? displayTokenAmount(_balance.internal, token) : displayBN(_balance.internal)}<br />
        Circulating Balance: {token ? displayTokenAmount(_balance.external, token) : displayBN(_balance.external)}
      </>
    )];
  }, [_balance, token]);

  // Automatically disable the input if
  // the form it's contained within is 
  // submitting, or if a zero balance is provided.
  // Otherwise fall back to the disabled prop.
  const isInputDisabled = (
    disabled
    || (balance && balance.eq(0))
    || form.isSubmitting
  );

  const clamp = useCallback((amount: BigNumber | null) => {
    if (!amount) return null;
    const max = _max === 'use-balance' ? balance : _max;
    if (max?.lt(amount)) return max;
    return amount;
  }, [_max, balance]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Always update the display amount right away.
    setDisplayAmount(
      // parseFloat converts 01 -> 1
      e.target.value ? parseFloat(e.target.value).toString() : ''
    );
    const newValue = e.target.value ? new BigNumber(e.target.value) : null;
    // Only push a new value to form state if the numeric
    // value is different. For example, if the displayValue
    // goes from '1.0' -> '1.00', don't trigger an update.
    if (newValue === null || !newValue.eq(field.value)) {
      const clampedValue = clamp(newValue);
      form.setFieldValue(field.name, clampedValue);
      _handleChange?.(clampedValue); // bubble up if necessary
    }
  }, [form, field.name, field.value, _handleChange, clamp]);

  // 
  const handleMax = useCallback(() => {
    if (balance) {
      const clampedValue = clamp(balance);
      form.setFieldValue(field.name, clampedValue);
      _handleChange?.(clampedValue);
    }
  }, [balance, clamp, form, field.name, _handleChange]);

  // Ignore scroll events on the input. Prevents
  // accidentally scrolling up/down the number input.
  const handleWheel = useCallback((e: any) => {
    // @ts-ignore
    e.target.blur();
  }, []);

  // PROBLEM:
  // BigNumber('0') == BigNumber('0.0').
  // If a user were to try to type in a small number (0.001 ETH for example),
  // using BigNumber to track the state of the input wouldn't work; when
  // I try to go from 0 to 0.0 the input value stays as just 0.
  //
  // SOLUTION:
  // Allow TokenInputField to maintain `displayAmount`, an internal `string` representation of `field.value`.
  // - On input change, store the input value (as a string) in displayAmount. Update form state 
  // - In the below effect, check for edge cases:
  //    a. If `field.value === undefined`         (i.e. the value has been cleared), reset the input.
  //    b. If `field.value !== BN(displayAmount)` (i.e. a new value was provided),   update `displayAmount`.
  useEffect(() => {
    console.debug('[TokenInputField] field.value or displayAmount changed', field.name, field.value, displayAmount);
    if (!field.value) setDisplayAmount('');
    else if (!field.value.eq(new BigNumber(displayAmount))) setDisplayAmount(field.value.toString());
  }, [field.value, field.name, displayAmount]);

  return (
    <FieldWrapper label={label}>
      {/* Input */}
      <TextField
        type="text"
        placeholder={placeholder || '0'}
        disabled={isInputDisabled}
        {...textFieldProps}
        // Override the following props.
        onWheel={handleWheel}
        value={displayAmount || ''}
        onChange={handleChange}
        InputProps={inputProps}
        sx={sx}
      />
      {/* Bottom Adornment */}
      {(balance && !hideBalance || quote) && (
        <Stack direction="row" alignItems="center" gap={0.5} px={0.5} py={1}>
          {/* Leaving the Stack rendered regardless of whether `quote` is defined
            * ensures that the Balance section gets flexed to the right side of
            * the input. */}
          <Stack direction="row" alignItems="center" sx={{ flex: 1 }} spacing={1}>
            <Typography variant="bodySmall">
              {quote}
            </Typography>
          </Stack>
          {(balance && !hideBalance) && (
            <>
              <Tooltip title={balanceTooltip}>
                <Typography variant="body1">
                  {balanceLabel}: {(
                    balance
                      ? token
                        // If `token` is provided, use its requested decimals
                        ? `${displayFullBN(balance, token.displayDecimals)}`
                        // Otherwise... *shrug*
                        // : balance.toString()
                        : `${displayFullBN(balance, 2)}`
                      : '0'
                  )}
                </Typography>
              </Tooltip>
              <Typography
                variant="body1"
                onClick={isInputDisabled ? undefined : handleMax}
                color={isInputDisabled ? 'text.secondary' : 'primary'}
                sx={{ cursor: isInputDisabled ? 'inherit' : 'pointer' }}
              >
                (Max)
              </Typography>
            </>
          )}
        </Stack>
      )}
    </FieldWrapper>
  );
};

const TokenInputField: React.FC<TokenInputProps> = ({ name, ...props }) => (
  <Field name={name}>
    {(fieldProps: FieldProps) => (
      <TokenInput
        {...fieldProps}
        {...props}
      />
    )}
  </Field>
);

export default TokenInputField;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { FieldProps } from 'formik';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/index';
import Token from 'classes/Token';

export type TokenInputFieldCustomProps = { 
  token: Token;
  balance: BigNumber | undefined;
  balanceLabel?: string;
  quote?: JSX.Element;
};

export type TokenInputFieldProps = (
  TokenInputFieldCustomProps // custom
  & Partial<TextFieldProps>  // MUI TextField
  & FieldProps               // Formik Field
);

const TokenInputField : React.FC<TokenInputFieldProps> = ({
  // -- Custom props
  token,
  balance,
  quote,
  balanceLabel = 'Balance',
  // -- Formik props
  field,
  form,
  // meta,
  // -- TextField props
  placeholder,
  disabled,
  sx,
  InputProps,
  // -- Other
  ...props
}) => {
  const [displayAmount, setDisplayAmount] = useState<string>(field.value);
  const inputProps = useMemo(() => ({
    // Styles
    inputProps: {
      min: 0.00,
    },
    classes: {},
    ...InputProps,
  } as TextFieldProps['InputProps']), [InputProps]);

  // Derived
  // Disable when: explicitly disabled, balance is undefined or zero
  const isInputDisabled = (
    disabled
    || !balance 
    || balance.eq(0)
    || form.isSubmitting
  );

  // Handlers
  const handleMax = useCallback(() => { 
    form.setFieldValue(field.name, balance);
  }, [form, field.name, balance]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Always update the display amount right away.
    setDisplayAmount(e.target.value); 
    const val = e.target.value ? new BigNumber(e.target.value) : null;
    // Only push a new value to form state if the numeric
    // value is different. For example, if the displayValue
    // goes from '1.0' -> '1.00', don't trigger an update.
    if (val === null || !val.eq(field.value)) {
      form.setFieldValue(
        field.name,
        // If a balance is provided, enforce it as a maximum.
        ((balance && val) && val.gt(balance))
          ? balance
          : val,
      );
    }
  }, [form, field.name, field.value, balance]);
  const handleWheel = useCallback((e) => {
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
    if (!field.value) setDisplayAmount('');
    else if (!field.value.eq(new BigNumber(displayAmount))) setDisplayAmount(field.value.toString());
  }, [field.value, displayAmount]);

  return (
    <Stack gap={0.5}>
      {/* Input */}
      <TextField
        type="number"
        placeholder={placeholder || '0'}
        disabled={isInputDisabled}
        {...props}
        onWheel={handleWheel}
        value={displayAmount || ''}
        onChange={handleChange}
        InputProps={inputProps}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '1.5rem'
          },
          ...sx
        }}
      />
      {/* Bottom Adornment */}
      <Stack direction="row" alignItems="center" spacing={0.5} px={0.75}>
        <Stack direction="row" alignItems="center" sx={{ flex: 1 }} spacing={1}>
          {quote}
        </Stack>
        <Typography sx={{ fontSize: 13.5 }}>
          {balanceLabel}: {balance ? `${displayFullBN(balance, token.displayDecimals)}` : '0'}
        </Typography>
        <Typography
          variant="body1"
          onClick={isInputDisabled ? undefined : handleMax}
          color={isInputDisabled ? 'text.secondary' : 'primary'}
          sx={{
            fontSize: 13.5,
            fontWeight: 600,
            cursor: isInputDisabled ? 'inherit' : 'pointer',
          }}
        >
          (Max)
        </Typography>
      </Stack>
    </Stack>
  );
};

export default TokenInputField;

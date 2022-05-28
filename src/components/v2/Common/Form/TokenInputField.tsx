import React, { useMemo } from 'react';
import {
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/index';

const TokenInputField : React.FC<{ 
  name: string;
  balance: BigNumber | undefined;
  quote: JSX.Element;
} & TextFieldProps> = ({
  // -- <Field /> props
  name,
  // -- Token-related props
  balance,
  quote,
  // -- <TextField /> props
  placeholder,
  disabled,
  sx,
  InputProps,
  ...props
}) => {
  const inputProps = useMemo(() => ({
    // Styles
    inputProps: {
      min: 0.00,
    },
    classes: {},
    ...InputProps,
  } as TextFieldProps['InputProps']), [InputProps]);
  return (
    <Field name={name} balance={balance}>
      {({ field, form } : FieldProps) => (
        <Stack gap={0.5}>
          {/* Input */}
          <TextField
            type="number"
            placeholder={placeholder || '0'}
            // Disable when:
            // - explicitly disabled
            // - balance is undefined or zero
            disabled={disabled || !balance || balance.eq(0)}
            {...props}
            {...field}
            onWheel={(e) => {
              // @ts-ignore
              e.target.blur();
            }}
            onChange={(e) => {
              console.debug(`[InputField] ${name} onChange`);
              // The field's value cannot be greater than 
              // the user's available balance.
              const val = e.target.value ? new BigNumber(e.target.value) : undefined;
              form.setFieldValue(
                name,
                (balance && val) && val.gt(balance) ? balance : val,
              );
            }}
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
              Balance: {balance ? displayFullBN(balance, 2) : '0'}
            </Typography>
            <Typography
              variant="body1"
              onClick={() => { 
                form.setFieldValue(name, balance);
              }}
              color="primary"
              sx={{ fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
            >
              (Max)
            </Typography>
          </Stack>
        </Stack>
      )}
    </Field>
  );
};

export default TokenInputField;

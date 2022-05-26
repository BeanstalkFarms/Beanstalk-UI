import React, { useMemo } from 'react';
import {
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import BigNumber from 'bignumber.js';

const InputField : React.FC<{ 
  name: string;
  balance?: number;
  quote: JSX.Element;
} & TextFieldProps> = ({
  // --
  name,
  balance,
  quote,
  // -- TextFieldProps
  sx,
  InputProps,
  placeholder,
  disabled,
  // -- Other  
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
            disabled={disabled || !balance || balance === 0}
            {...props}
            {...field}
            onWheel={(e) => {
              // @ts-ignore
              e.target.blur();
            }}
            onChange={(e) => {
              console.debug(`[InputField] ${name} onChange`);
              const val = e.target.value ? new BigNumber(e.target.value) : undefined;
              form.setFieldValue(
                name,
                balance && val !== undefined && val > balance ? balance : val,
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
              Balance: {balance ? balance.toLocaleString() : '0'}
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

export default InputField;

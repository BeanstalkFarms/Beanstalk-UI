import React, { useMemo } from 'react';
import {
  TextField,
  TextFieldProps,
} from '@mui/material';
import { FastField, FieldProps } from 'formik';

const InputField : React.FC<{ name: string; } & TextFieldProps> = ({
  // 
  name,
  // TextFieldProps
  sx,
  InputProps,
  placeholder,
  ...props
}) => {
  const inputProps = useMemo(() => ({
    // Styles
    inputProps: {
      min: 0.00,
    },
    classes: {},
    ...InputProps,
  }), [InputProps]);
  return (
    <FastField name={name}>
      {({ field, form, meta } : FieldProps) => (
        <>
          <TextField
            type="number"
            placeholder={placeholder || '0'}
            {...field}
            {...props}
            InputProps={inputProps}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.5rem'
              },
              ...sx
            }}
          />
          <div>{name}: render {new Date().toISOString()}</div>
        </>
      )}
    </FastField>
  );
};

export default InputField;

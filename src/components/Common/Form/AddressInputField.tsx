import React, { useCallback } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Field, FieldProps } from 'formik';
import { ethers } from 'ethers';

export type AddressInputFieldProps = (
  Partial<TextFieldProps> &
  FieldProps
);

const validateAddress = (value: string) => ethers.utils.isAddress(value);

const AddressInputField : React.FC<AddressInputFieldProps> = ({
  name,
  ...props
}) => {
  return (
    <Field name={name} validate={validateAddress}>
      {(fieldProps: FieldProps) => (
        <TextField
          {...fieldProps.field}
          {...props}
        />
      )}
    </Field>
  )
}

export default AddressInputField
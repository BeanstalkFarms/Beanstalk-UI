import React, { useCallback } from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { Field, FieldProps } from 'formik';
import { ethers } from 'ethers';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type AddressInputFieldProps = (
  Partial<TextFieldProps>
  & { name: string }
);

// export const ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]$/;
export const ETHEREUM_ADDRESS_CHARS = /([0][x]?[a-fA-F0-9]{0,42})$/;

const validateAddress = (value: string) => {
  let error;
  // if (!ETHEREUM_ADDRESS.test(value)) {
  if (!ethers.utils.isAddress(value)) {
    error = 'Invalid address'
  }
  return error;
}


const AddressInputField : React.FC<AddressInputFieldProps> = ({
  name,
  ...props
}) => {
  return (
    <Field name={name} validate={validateAddress} validateOnChange={false} validateOnBlur>
      {(fieldProps: FieldProps) => {
        const isValid = fieldProps.field.value && !fieldProps.meta.error;
        return (
          <>
            <TextField
              fullWidth
              type="text"
              placeholder="0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5"
              disabled={isValid}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isValid ? (
                      <CheckIcon color="primary" />
                    ) : (
                      fieldProps.meta.value ? (
                        <CloseIcon color="warning" />
                      ) : null
                    )}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isValid && (
                      <IconButton size="small" onClick={() => fieldProps.form.setFieldValue(name, '')}>
                        <CloseIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
              {...props}
              {...fieldProps.field}
              value={fieldProps.field.value}
              // onChange={fieldProps.field.onChange}
              // onBlur={fieldProps.field.onBlur}
              onChange={(e) => {
                // Allow field to change if the value has been removed, or if
                // a valid address character has been input.
                if (!e.target.value || ETHEREUM_ADDRESS_CHARS.test(e.target.value)) {
                  fieldProps.field.onChange(e);
                }
              }}
            />
            {/* <div>{fieldProps.meta.error}</div> */}
          </>
        );
      }}
    </Field>
  )
}

export default AddressInputField
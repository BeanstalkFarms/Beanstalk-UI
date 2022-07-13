import React, { useCallback, useMemo } from 'react';
import { Box, IconButton, InputAdornment, Link, Stack, TextField, TextFieldProps, Tooltip, Typography } from '@mui/material';
import { Field, FieldProps } from 'formik';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useChainId from 'hooks/useChain';
import { CHAIN_INFO } from 'constants/index';
import OutputField from './OutputField';

export type AddressInputFieldProps = (
  Partial<TextFieldProps>
  & { name: string }
);

export const ETHEREUM_ADDRESS_CHARS = /([0][x]?[a-fA-F0-9]{0,42})$/;

const validateAddress = (value: string) => {
  let error;
  if (!ETHEREUM_ADDRESS_CHARS.test(value)) {
    error = 'Invalid address';
  }
  return error;
};

const AddressInputFieldInner : React.FC<FieldProps & AddressInputFieldProps> = ({
  name,
  disabled,
  /// Formik
  field,
  meta,
  form,
  ...props
}) => {
  const chainId = useChainId();
  const isValid = field.value && !meta.error;
  const onChange = useCallback((e) => {
    // Allow field to change if the value has been removed, or if
    // a valid address character has been input.
    if (!e.target.value || ETHEREUM_ADDRESS_CHARS.test(e.target.value)) {
      field.onChange(e);
    }
  }, [field]);
  const InputProps = useMemo(() => ({
    startAdornment: meta.value ? (
      <InputAdornment position="start">
        <CloseIcon color="warning" /> 
      </InputAdornment>
    ) : null
  }), [meta.value]);
  if (isValid) {
    return (
      <OutputField sx={{ height: 67.5 /* lock to same height as input */ }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon sx={{ height: 20, width: 20, fontSize: '100%' }} color="primary" />
          <Typography>
            <Tooltip title="View on Etherscan">
              <Link
                underline="hover"
                color="text.primary"
                href={`${CHAIN_INFO[chainId].explorer}/address/${field.value}`}
                target="_blank"
                rel="noreferrer"
              >
                {field.value}
              </Link>
            </Tooltip>
          </Typography>
        </Stack>
        <Box>
          <IconButton onClick={() => form.setFieldValue(name, '')}>
            <CloseIcon sx={{ height: 20, width: 20, fontSize: '100%' }} />
          </IconButton>
        </Box>
      </OutputField>
    );
  }
  return (
    <TextField
      fullWidth
      type="text"
      placeholder="0x0000"
      disabled={isValid || disabled}
      InputProps={InputProps}
      {...props}
      name={field.name}
      value={field.value}
      onBlur={field.onBlur}
      onChange={onChange}
    />
  );
};

const AddressInputField : React.FC<AddressInputFieldProps> = ({
  name,
  ...props
}) => (
  <Field name={name} validate={validateAddress} validateOnChange={false} validateOnBlur>
    {(fieldProps: FieldProps) => (
      <AddressInputFieldInner
        name={name}
        {...props}
        {...fieldProps}
        />
      )}
  </Field>
  );

export default AddressInputField;

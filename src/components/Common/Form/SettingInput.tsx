import React from 'react';
import { Field, FieldProps } from 'formik';
import { Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';

const SettingInput : React.FC<{
  name: string;
  label: string;
  endAdornment?: React.ReactNode;
}> = ({
  name,
  label,
  endAdornment,
}) => (
  <Field name={name}>
    {(fieldProps: FieldProps) => (
      <Stack direction="row" gap={5} alignItems="center" justifyContent="space-between">
        <Typography color="text.secondary">{label}</Typography>
        <Box>
          <TextField
            size="small"
            variant="standard"
            type="number"
            sx={{
                minWidth: 'none',
                width: 50,
              }}
            InputProps={{
                endAdornment,
                sx: {
                  fontSize: 16,
                }
              }}
            {...fieldProps.field}
            />
        </Box>
      </Stack>
      )}
  </Field>
  );

export default SettingInput;

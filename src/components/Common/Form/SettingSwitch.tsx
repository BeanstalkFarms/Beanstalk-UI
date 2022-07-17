import React from 'react';
import { Field, FieldProps } from 'formik';
import { Stack, Switch, Typography } from '@mui/material';
import { Box } from '@mui/system';

const SettingSwitch: React.FC<{
  name: string;
  label: string;
}> = ({ name, label }) => (
  <Field name={name}>
    {(fieldProps: FieldProps) => (
      <Stack
        direction="row"
        gap={5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography color="text.secondary">{label}</Typography>
        <Box>
          <Switch
            {...fieldProps.field}
            checked={fieldProps.field.value === true}
          />
        </Box>
      </Stack>
    )}
  </Field>
);

export default SettingSwitch;

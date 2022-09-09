import React from 'react';
import { Field, FieldProps } from 'formik';
import { Switch, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Row from '~/components/Common/Row';

const SettingSwitch : React.FC<{
  name: string;
  label: string;
}> = ({
  name,
  label,
}) => (
  <Field name={name}>
    {(fieldProps: FieldProps) => (
      <Row gap={5} justifyContent="space-between">
        <Typography color="text.secondary">{label}</Typography>
        <Box>
          <Switch
            {...fieldProps.field}
            checked={fieldProps.field.value === true}
          />
        </Box>
      </Row>
    )}
  </Field>
);

export default SettingSwitch;

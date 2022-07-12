import React, { ReactNode } from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';

const FieldWrapper : React.FC<{ label?: ReactNode | string; tooltip?: string }> = ({ label, tooltip, children }) => (
  <Stack gap={0}>
    {label && (
    <Tooltip title={tooltip !== undefined ? tooltip : ''} placement="top-start">
      <Typography sx={{ fontSize: 15, px: 0.5 }}>{label}</Typography>
    </Tooltip>
      )}
    {children}
  </Stack>
  );

export default FieldWrapper;

import React, { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

const FieldWrapper : React.FC<{ label?: ReactNode | string }> = ({ label, children }) => {
  return (
    <Stack gap={0.5}>
      {label && (
        <Typography sx={{ fontSize: 15, px: 0.5 }}>{label}</Typography>
      )}
      {children}
    </Stack>
  );
};

export default FieldWrapper;

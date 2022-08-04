import { Stack, Typography } from '@mui/material';
import React from 'react';

const Soon : React.FC<{ height?: number }> = ({ height = 300, children }) => (
  <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: '100%', height }} p={2}>
    <Typography textAlign="center" color="gray">
      {children || 'This module is under development and will be available soon.'}
    </Typography>
  </Stack>
);

export default Soon;

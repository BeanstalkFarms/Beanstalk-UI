import React from 'react';
import { Stack, StackProps } from '@mui/material';

const Centered : React.FC<StackProps> = ({ children, ...props }) => (
  <Stack direction="column" alignItems="center" justifyContent="center" height="100%" {...props}>
    {children}
  </Stack>
);

export default Centered;

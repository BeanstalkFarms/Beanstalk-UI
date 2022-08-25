import { Stack, StackProps } from '@mui/material';
import React from 'react';

const Row : React.FC<StackProps> = ({ children, ...props }) => (
  <Stack direction="row" alignItems="center" {...props}>{children}</Stack>
);

export default Row; 

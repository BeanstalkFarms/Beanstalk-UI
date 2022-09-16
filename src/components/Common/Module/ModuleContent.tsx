import { Box, BoxProps } from '@mui/material';
import React from 'react';

export const ModuleContent : React.FC<BoxProps> = ({ children, ...props }) => (
  <Box px={1} pb={1} {...props}>
    {children}
  </Box>
);

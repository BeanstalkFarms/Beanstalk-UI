import { Box } from '@mui/material';
import React from 'react';

export const ModuleContent : React.FC<{}> = ({ children }) => (
  <Box px={1} pb={1}>
    {children}
  </Box>
);

import { Box } from '@mui/material';
import React from 'react';

export const ModuleHeader : React.FC<{}> = ({ children }) => (
  <Box px={2} pt={2} pb={1.5}>{children}</Box>
);

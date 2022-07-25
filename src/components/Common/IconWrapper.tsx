import React from 'react';
import { Box, BoxProps } from '@mui/material';

/**
 * Sometimes we need an icon to live inside a
 * box of some fixed size.An example of this is
 * the Alert component. The icon size should be
 * 20px, but the box it lives in needs to be 25px
 * so that its icon & text aligns with the
 * Transaction Details accordion.
 */
const IconWrapper : React.FC<{ boxSize: number } & BoxProps> = ({ boxSize, children, sx }) => (
  <Box
    width={boxSize}
    height={boxSize}
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{
      mr: 1,
      ...sx
    }}
  >
    {children}
  </Box>
);

export default IconWrapper;

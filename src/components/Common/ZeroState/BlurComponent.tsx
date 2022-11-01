import React from 'react';
import { Stack, Typography, StackProps } from '@mui/material';

import { FC } from '~/types';

const BlurComponent : FC<StackProps & { blur?: number; opacity?: number }> = ({ children, opacity = 0.4, blur = 8, sx }) => (
  <Stack
    sx={{
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      zIndex: 999,
      textAlign: 'center',
      ...sx
    }}
    alignItems="center"
    justifyContent="center"
  >
    <Typography variant="subtitle1" color="text.secondary">
      {children}
    </Typography>
  </Stack>
);

export default BlurComponent;

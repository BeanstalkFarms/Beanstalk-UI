import React from 'react';
import { Stack, Typography, StackProps } from '@mui/material';

const BlurComponent : React.FC<StackProps> = ({ children, sx }) => {
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        textAlign: 'center',
        ...sx
      }}
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="subtitle1" color="text.secondary" sx={{ opacity: 0.7 }}>
        {children}
      </Typography>
    </Stack>
  );
};

export default BlurComponent;

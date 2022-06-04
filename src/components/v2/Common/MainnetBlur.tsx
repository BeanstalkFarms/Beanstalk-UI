import React from 'react';
import { Stack, Typography } from '@mui/material';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';

const MainnetBlur : React.FC = ({ children }) => {
  const chainId = useChainId();
  return chainId === SupportedChainId.MAINNET ? (
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
        pb: 5,
        px: 2,
        textAlign: 'center',
      }}
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="subtitle1" color="text.secondary" sx={{ opacity: 0.7 }}>
        {children}
      </Typography>
    </Stack>
  ) : null;
};

export default MainnetBlur;

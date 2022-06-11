import React from 'react';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import BlurComponent from './BlurComponent';

const MainnetBlur : React.FC = ({ children }) => {
  const chainId = useChainId();
  return chainId === SupportedChainId.MAINNET ? (
    <BlurComponent sx={{ pb: 5, px: 2 }}>{children}</BlurComponent>
  ) : null;
};

export default MainnetBlur;

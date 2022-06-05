import { SupportedChainId } from 'constants/chains';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

/**
 * Returns the current chainId, falling back to MAINNET
 * if one isn't provided by the wallet connector.
 * 
 * @returns SupportedChainId
 */
const useChainId = () => {
  const { activeChain } = useNetwork();
  return useMemo(
    () => activeChain?.id || SupportedChainId.MAINNET,
    [activeChain?.id]
  );
};

export default useChainId;

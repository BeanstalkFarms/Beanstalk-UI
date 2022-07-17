import { SupportedChainId } from 'constants/chains';
import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

/**
 * Returns the current chainId, falling back to MAINNET
 * if one isn't provided by the wallet connector.
 *
 * @returns SupportedChainId
 */
export default function useChainId() {
  const { activeChain } = useNetwork();
  return useMemo(
    () => activeChain?.id || SupportedChainId.MAINNET,
    [activeChain?.id]
  );
}

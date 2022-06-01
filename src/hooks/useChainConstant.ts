import { SupportedChainId } from 'constants/chains';
import { useCallback } from 'react';
import { useNetwork } from 'wagmi';

type ConstantByChain = { [key: number] : any };

export function getChainConstant<T extends ConstantByChain>(map: T, chainId?: SupportedChainId) : T[keyof T] {
  // If no chain available, use mainnet.
  if (!chainId) {
    return map[SupportedChainId.MAINNET];
  }
  // If we're on localhost, it's probably a forked mainnet node.
  // Use LOCALHOST-specific value if available, otherwise
  // fall back to mainnet.
  if (chainId === SupportedChainId.LOCALHOST) {
    return map[chainId] || map[SupportedChainId.MAINNET];
  }
  // Return value for this chain.
  return map[chainId];
}

export function useGetChainConstant() {
  const { activeChain } = useNetwork();
  return useCallback(
    (map) => getChainConstant(map, activeChain?.id),
    [activeChain?.id]
  );
}

export default function useChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
  const get = useGetChainConstant();
  return get(map);
}

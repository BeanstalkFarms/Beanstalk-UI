import { SupportedChainId, TESTNET_CHAINS } from 'constants/chains';
import { useCallback } from 'react';
import { useNetwork } from 'wagmi';

type ConstantByChain = { [key: number] : any };

export function getChainConstant<T extends ConstantByChain>(map: T, chainId?: SupportedChainId) : T[keyof T] {
  // If no chain available, use the value for MAINNET.
  if (!chainId || !SupportedChainId[chainId]) {
    return map[SupportedChainId.MAINNET];
  }
  // If we're on a Testnet, it's probably a forked mainnet node.
  // Use Testnet-specific value if available, otherwise
  // fall back to MAINNET. This allows for test forking.
  if (TESTNET_CHAINS.has(chainId)) {
    return map[chainId] || map[SupportedChainId.MAINNET];
  }
  // Return value for the active chainId.
  return map[chainId];
}

export function useGetChainConstant() {
  const { activeChain } = useNetwork();
  return useCallback(
    <T extends ConstantByChain>(map: T) => getChainConstant<T>(map, activeChain?.id),
    [activeChain?.id]
  );
}

export default function useChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
  const get = useGetChainConstant();
  return get(map);
}

import { useCallback } from 'react';
import { ConstantByChain, getChainConstant } from 'util/Chain';
import { useNetwork } from 'wagmi';

export function useGetChainConstant() {
  const { activeChain } = useNetwork();
  return useCallback(
    <T extends ConstantByChain>(map: T) =>
      getChainConstant<T>(map, activeChain?.id),
    [activeChain?.id]
  );
}

export default function useChainConstant<T extends ConstantByChain>(
  map: T
): T[keyof T] {
  const { activeChain } = useNetwork();
  return getChainConstant<T>(map, activeChain?.id);
}

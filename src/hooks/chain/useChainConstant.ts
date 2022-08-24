import { useCallback } from 'react';
import { useNetwork } from 'wagmi';
import { ChainConstant, getChainConstant } from '~/util/Chain';

export function useGetChainConstant() {
  const { activeChain } = useNetwork();
  return useCallback(
    <T extends ChainConstant>(map: T) => getChainConstant<T>(map, activeChain?.id),
    [activeChain?.id]
  );
}

export default function useChainConstant<T extends ChainConstant>(map: T) : T[keyof T] {
  const { activeChain } = useNetwork();
  return getChainConstant<T>(map, activeChain?.id);
}

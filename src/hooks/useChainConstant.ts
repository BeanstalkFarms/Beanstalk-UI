import { SupportedChainId } from 'constants/chains';
import { useCallback } from 'react';
import { useNetwork } from 'wagmi';

type ConstantByChain = { [key: number] : any };

export function useGetChainConstant() {
  const { activeChain } = useNetwork();
  return useCallback(
    // I find the function expression much easier to parse here,
    // so going to break our usual preference for arrow functions. -SC
    // eslint-disable-next-line prefer-arrow-callback
    function getChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
      return map[activeChain?.id || SupportedChainId.MAINNET];
    },
    [activeChain?.id]
  )
}

export default function useChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
  const getChainConstant = useGetChainConstant();
  return getChainConstant(map);
}

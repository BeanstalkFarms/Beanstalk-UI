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
      // If no chain available, use mainnet.
      if (!activeChain?.id) {
        return map[SupportedChainId.MAINNET];
      }
      // If we're on localhost, it's probably a forked mainnet node.
      // Use LOCALHOST-specific value if available, otherwise
      // fall back to mainnet.
      if (activeChain.id === SupportedChainId.LOCALHOST) {
        return map[SupportedChainId.MAINNET]; // map[activeChain.id] || 
      }
      // Return value for this chain.
      return map[activeChain.id];
    },
    [activeChain?.id]
  );
}

export default function useChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
  const getChainConstant = useGetChainConstant();
  return getChainConstant(map);
}

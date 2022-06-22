import { useCallback } from 'react';
import { SupportedChainId } from 'constants/index';
import useChainId from './useChain';

export const REPLANTED_CHAINS = new Set([
  SupportedChainId.HARDHAT,
]);

export default function useMigrateCall() {
  const chainId = useChainId();
  return useCallback(
    // eslint-disable-next-line prefer-arrow-callback
    function migrate<T1, T2>(
      contract: T1 | T2,
      opts: [
        (c: T1) => Promise<any>,
        (c: T2) => Promise<any>,
      ],
    ) {
      if (REPLANTED_CHAINS.has(chainId)) {
        return opts[1](contract as T2);
      }
      return opts[0](contract as T1);
    },
    [chainId]
  );
}

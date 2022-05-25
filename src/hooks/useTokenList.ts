import { useNetwork } from 'wagmi';
import { TokenOrTokenMap, TokensByAddress } from 'constants/v2/tokens';
import { SupportedChainId } from 'constants/chains';
import { useMemo } from 'react';
import Token from 'classes/Token';

export default function useTokenList(list: TokenOrTokenMap[]) {
  const { activeChain } = useNetwork();
  return useMemo(() => {
    if (!activeChain?.id) return {};
    return list.reduce<TokensByAddress>(
      (acc, curr) => {
        const token = curr instanceof Token ? curr : curr[(activeChain?.id || SupportedChainId.MAINNET) as number];
        if (token) acc[token.address] = token;
        return acc;
      },
      {}
    );
  }, [
    activeChain?.id,
    list
  ]);
}

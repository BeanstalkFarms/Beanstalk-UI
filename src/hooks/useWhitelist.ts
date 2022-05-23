import { useNetwork } from "wagmi";
import { whitelist as SiloWhitelist } from 'constants/v2/tokens';
import { SupportedChainId } from "constants/chains";
import { useMemo } from "react";
import { Token } from "classes";

export default function useWhitelist() {
  const { activeChain } = useNetwork();
  const whitelist = useMemo(() => {
    return SiloWhitelist.reduce(
      (prev, curr) => {
        const token = curr[(activeChain?.id || SupportedChainId.MAINNET) as number];
        if (token) prev[token.address] = token;
        return prev;
      },
      {}
    )
  }, [activeChain?.id])
  return whitelist;
}
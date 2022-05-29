import { SupportedChainId } from "constants/chains";
import { useMemo } from "react";
import { useNetwork } from "wagmi";

const useChainId = () => {
  const { activeChain } = useNetwork();
  return useMemo(() => activeChain?.id || SupportedChainId.MAINNET, [activeChain?.id]);
}

export default useChainId;
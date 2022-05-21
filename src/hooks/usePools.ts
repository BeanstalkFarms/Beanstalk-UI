import { useNetwork } from "wagmi";
import pools from 'constants/v2/pools';
import { SupportedChainId } from "constants/chains";

export default function usePools() {
  const { activeChain } = useNetwork();
  
  if (!activeChain?.id || !pools[activeChain?.id as SupportedChainId]) return {};

  return pools[activeChain.id];
}
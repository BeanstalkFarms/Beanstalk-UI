import { useNetwork } from "wagmi";
import tokens from 'constants/v2/tokens';
import { SupportedChainId } from "constants/chains";

export default function useWhitelist() {
  const { activeChain } = useNetwork();
  
  if (!activeChain?.id || !pools[activeChain?.id as SupportedChainId]) return {};

  return pools[activeChain.id];
}
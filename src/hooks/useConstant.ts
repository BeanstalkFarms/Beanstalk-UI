import { SupportedChainId } from "constants/chains";
import { useNetwork } from "wagmi";

type ConstantByChain = { [key: number] : any };

export default function useChainConstant<O extends ConstantByChain>(o: O) : O[keyof O] {
  const { activeChain } = useNetwork();
  
  if (!activeChain?.id || !o[activeChain?.id as SupportedChainId]) {
    throw new Error('No supported constant found.');
  }

  return o[activeChain.id];
}
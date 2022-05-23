import { SupportedChainId } from "constants/chains";
import { useNetwork } from "wagmi";
import useWhitelist from "./useWhitelist";

type ConstantByChain = { [key: number] : any };

export default function useChainConstant<O extends ConstantByChain>(o: O) : O[keyof O] {
  const { activeChain } = useNetwork();
  
  // if (!activeChain?.id || !o[activeChain?.id as SupportedChainId]) {
  //   throw new Error('No supported constant found.');
  // }

  // FIXME: fall back to mainnet when wallet isn't connected?
  return o[activeChain?.id || SupportedChainId.MAINNET];
}
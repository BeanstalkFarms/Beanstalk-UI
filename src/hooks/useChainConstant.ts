import { SupportedChainId } from 'constants/chains';
import { useNetwork } from 'wagmi';

type ConstantByChain = { [key: number] : any };

export default function useChainConstant<T extends ConstantByChain>(map: T) : T[keyof T] {
  const { activeChain } = useNetwork();

  // FIXME: fall back to mainnet when wallet isn't connected?
  return map[activeChain?.id || SupportedChainId.MAINNET];
}

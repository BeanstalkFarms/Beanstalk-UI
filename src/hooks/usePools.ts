import { useNetwork } from 'wagmi';
import pools from 'constants/v2/pools';
import { SupportedChainId } from 'constants/chains';
import useChainConstant from './useConstant';

export default function usePools() {
  return useChainConstant(pools);
}

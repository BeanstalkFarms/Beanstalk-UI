import pools from 'constants/pools';
import useChainConstant from './useChainConstant';

export default function usePools() {
  return useChainConstant(pools);
}

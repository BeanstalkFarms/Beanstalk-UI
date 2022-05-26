import pools from 'constants/v2/pools';
import useChainConstant from './useChainConstant';

export default function usePools() {
  return useChainConstant(pools);
}

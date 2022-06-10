import ALL_POOLS from 'constants/pools';
import useChainConstant from './useChainConstant';

export default function usePools() {
  return useChainConstant(ALL_POOLS);
}

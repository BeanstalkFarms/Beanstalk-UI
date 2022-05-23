import pools from 'constants/v2/pools';
import useChainConstant from './useConstant';

export default function usePools() {
  return useChainConstant(pools);
}

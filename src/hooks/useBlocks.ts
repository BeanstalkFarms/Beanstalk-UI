import { DEPLOYMENT_BLOCKS } from 'constants/blocks';
import useChainConstant from './useChainConstant';

export default function useBlocks() {
  return useChainConstant(DEPLOYMENT_BLOCKS);
}

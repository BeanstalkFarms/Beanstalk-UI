import { DEPLOYMENT_BLOCKS } from 'constants/v2/blocks';
import useChainConstant from './useConstant';

export default function useBlocks() {
  return useChainConstant(DEPLOYMENT_BLOCKS);
}

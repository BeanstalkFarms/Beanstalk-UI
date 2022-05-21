import useChainConstant from "./useConstant";
import { DEPLOYMENT_BLOCKS } from "constants/v2/blocks";

export default function useBlocks() {
  return useChainConstant(DEPLOYMENT_BLOCKS);
}
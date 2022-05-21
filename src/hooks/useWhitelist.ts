import { useNetwork } from "wagmi";
import whitelist from 'constants/v2/tokens';
import { SupportedChainId } from "constants/chains";
import useChainConstant from "./useConstant";

export default function useWhitelist() {
  return useChainConstant(whitelist);
}
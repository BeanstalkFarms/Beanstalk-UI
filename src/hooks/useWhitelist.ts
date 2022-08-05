import { ERC20Token } from 'classes/Token';
import { GENERALIZED_SILO_WHITELIST, SILO_WHITELIST } from 'constants/tokens';
import useTokenMap from './useTokenMap';

export default function useWhitelist() {
  return useTokenMap<ERC20Token>(SILO_WHITELIST);
}

export function useGeneralizedWhitelist() {
  return useTokenMap(GENERALIZED_SILO_WHITELIST);
}

import { SILO_WHITELIST } from 'constants/tokens';
import useTokenMap from './useTokenMap';

export default function useWhitelist() {
  return useTokenMap(SILO_WHITELIST);
}

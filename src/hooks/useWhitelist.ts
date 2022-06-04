import { SILO_TOKENS } from 'constants/tokens';
import useTokenMap from './useTokenMap';

export default function useWhitelist() {
  return useTokenMap(SILO_TOKENS);
}

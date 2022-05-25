import { SiloWhitelistTokens } from 'constants/v2/tokens';
import useTokenMap from './useTokenMap';

export default function useWhitelist() {
  return useTokenMap(SiloWhitelistTokens);
}

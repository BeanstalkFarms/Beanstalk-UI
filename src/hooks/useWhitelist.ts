import { SiloWhitelistTokens } from 'constants/v2/tokens';
import useTokenList from './useTokenList';

export default function useWhitelist() {
  return useTokenList(SiloWhitelistTokens);
}

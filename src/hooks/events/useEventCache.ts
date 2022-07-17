import useAccount from 'hooks/ledger/useAccount';
import useChainId from 'hooks/useChain';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { EventCacheName } from 'state/farmer/events2';
import { getEventCacheId } from 'util/State';

/**
 *
 * @param cacheId CacheID
 * @returns undefined if a wallet is not connected
 * @returns empty object if this cache does not exist
 * @returns cache
 */
export default function useEventCache(cacheId: EventCacheName) {
  const chainId = useChainId();
  const account = useAccount();
  const id = account ? getEventCacheId(chainId, account, cacheId) : undefined;
  return useSelector<
    AppState,
    AppState['_farmer']['events2'][string] | undefined
  >((state) => (id ? state._farmer.events2[id] || {} : undefined));
}

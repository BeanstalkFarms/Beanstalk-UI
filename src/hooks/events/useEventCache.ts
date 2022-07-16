import useChainId from "hooks/useChain";
import { useSelector } from "react-redux";
import { AppState } from "state";
import { CacheID } from "state/farmer/events2";
import { getEventCacheId } from "util/State";
import { useAccount } from "wagmi";

/**
 * 
 * @param cacheId CacheID
 * @returns undefined if a wallet is not connected
 * @returns empty object if this cache does not exist
 * @returns cache
 */
export default function useEventCache(cacheId: CacheID) {
  const chainId           = useChainId();
  const { data: account } = useAccount();
  const id = account?.address ? getEventCacheId(chainId, account.address, cacheId) : undefined;
  return useSelector<AppState, AppState['_farmer']['events2'][string] | undefined>(
    (state) => (id ? (state._farmer.events2[id] || {}) : undefined)
  )
}
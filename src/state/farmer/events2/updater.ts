import { ethers } from 'ethers';
import useChainId from 'hooks/useChain';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useProvider } from 'wagmi';
import flattenDeep from 'lodash/flattenDeep';
import { Event } from '~/lib/Beanstalk/EventProcessor';
import useEventCache from 'hooks/events/useEventCache';
import useAccount from 'hooks/ledger/useAccount';
import { EventCacheName } from '.';
import { ingestEvents } from './actions';

export type GetQueryFilters = (
  /**
   * The Farmer account which we're querying against.
   */
  account: string,
  /**
   * The start block from which to query. If not provided,
   * the query filter should fall back to an appropriately 
   * placed block.
   */
  fromBlockOrBlockhash?: string | number | undefined,
  /**
   * The end block to query up until. If not provided,
   * the query filter should fall back to an appropriately 
   * placed block or block tag (likely 'latest').
   */
  toBlock?: number | undefined,
) => (Promise<ethers.Event[]>)[];

export const reduceEvent = (prev: Event[], e: ethers.Event) => {
  try {
    // const returnValues = parseBNJS(
    //   e.decode?.(
    //     e.data,
    //     e.topics
    //   ) || {}
    // );
    prev.push({
      event: e.event,
      args: e.args,
      blockNumber: e.blockNumber,
      logIndex: e.logIndex,
      transactionHash: e.transactionHash,
      transactionIndex: e.transactionIndex,
      // backwards compat
      // facet: getEventFacet(e.event),
      // returnValues,
    });
  } catch (err) {
    console.error(`Failed to parse event ${e.event} ${e.transactionHash}`, err, e);
  }
  return prev;
};

export const sortEvents = (a: Event, b: Event) => {
  const diff = a.blockNumber - b.blockNumber;
  if (diff !== 0) return diff;
  return a.logIndex - b.logIndex;
};

export default function useEvents(cacheName: EventCacheName, getQueryFilters: GetQueryFilters) {
  const dispatch  = useDispatch();
  const chainId   = useChainId();
  const provider  = useProvider();
  const account   = useAccount();

  ///
  const cache = useEventCache(cacheName);

  /**
   * FIXME: most other similar "fetch" hooks related to the Farmer
   * accept an account as a parameter, however this hook wasn't designed
   * 
   */
  const fetch = useCallback(async (_startBlockNumber?: number) => {
    if (!account) return;
    const existingEvents = (cache?.events || []);

    /// If a start block is provided, use it; otherwise fall back
    /// to the most recent block queried in this cache.
    const startBlockNumber = (
      _startBlockNumber
      || (cache?.endBlockNumber && cache.endBlockNumber + 1)
      // let the query filter decide
    );

    /// Set a deterministic latest block. This lets us know what range
    /// of blocks have already been queried (even if they don't have
    /// corresponding events). 
    const endBlockNumber = await provider.getBlockNumber();
    
    /// FIXME: edge case where user does two transactions in one block
    if (startBlockNumber && startBlockNumber > endBlockNumber) return existingEvents;

    /// if a starting block isn't provided, getQueryFilters will
    /// fall back to the most efficient block for a given query.
    const filters = getQueryFilters(account, startBlockNumber, endBlockNumber);

    ///
    console.debug(`[useEvents] ${cacheName}: fetching events`, {
      cacheId: cacheName,
      startBlockNumber,
      endBlockNumber,
      filterCount: filters.length,
      cacheEndBlockNumber: cache?.endBlockNumber,
    });

    ///
    const results = await Promise.all(filters); // [[0,1,2],[0,1],...]
    const newEvents = (
      flattenDeep<ethers.Event>(results)
        .reduce<Event[]>(reduceEvent, [])
        .sort(sortEvents)
    ); // [0,0,1,1,2]

    console.debug(`[useEvents] ${cacheName}: fetched ${newEvents.length} new events`);

    dispatch(ingestEvents({
      // cache info
      cache: cacheName,
      account,
      chainId,
      /// if startBlockNumber wasn't set, use the earliest block found.
      /// FIXME: handle undefined
      startBlockNumber: startBlockNumber || newEvents[0]?.blockNumber,
      endBlockNumber,
      timestamp: new Date().getTime(),
      events: newEvents,
    }));

    return [
      ...existingEvents,
      ...newEvents,
    ];
  }, [
    dispatch,
    account,
    cache?.endBlockNumber,
    cache?.events,
    cacheName,
    chainId,
    getQueryFilters,
    provider,
  ]);

  return [cache ? fetch : undefined];
}

import { ethers } from "ethers";
import useChainId from "hooks/useChain";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount, useProvider } from "wagmi";
import flattenDeep from 'lodash/flattenDeep';
import { getEventFacet } from "util/GetEventFacet";
import { parseBNJS } from "util/index";
import { Event } from 'lib/Beanstalk/EventProcessor';
import { ingestEvents } from "./actions";
import { CacheID } from ".";
import useEventCache from "hooks/events/useEventCache";

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
}

export default function useEvents(cacheId: CacheID, getQueryFilters: GetQueryFilters) {
  const dispatch  = useDispatch();
  const chainId   = useChainId();
  const provider  = useProvider();
  const { data: account } = useAccount();

  ///
  const cache = useEventCache(cacheId);

  /**
   * 
   */
  const fetch = useCallback(async (_startBlockNumber?: number) => {
    if (!account?.address) return undefined;

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
    const filters = getQueryFilters(account.address, startBlockNumber, endBlockNumber);

    ///
    console.debug(`[useEvents] ${cacheId}: fetching events`, {
      cacheId,
      startBlockNumber,
      endBlockNumber,
      filterCount: filters.length,
      cacheEndBlockNumber: cache?.endBlockNumber,
    })

    ///
    const results = await Promise.all(filters); // [[0,1,2],[0,1],...]
    const newEvents = (
      flattenDeep<ethers.Event>(results)
        .reduce<Event[]>(reduceEvent, [])
        .sort(sortEvents)
    ); // [0,0,1,1,2]

    console.debug(`[useEvents] ${cacheId}: fetched ${newEvents.length} new events`);

    dispatch(ingestEvents({
      // cache info
      cache: cacheId,
      account: account.address,
      chainId,
      /// if startBlockNumber wasn't set, use the earliest block found.
      /// FIXME: handle undefined
      startBlockNumber: startBlockNumber || newEvents[0]?.blockNumber,
      endBlockNumber,
      timestamp: new Date().getTime(),
      events: newEvents,
    }))

    return [
      ...existingEvents,
      ...newEvents,
    ];
  }, [
    dispatch,
    account?.address,
    cache?.endBlockNumber,
    cache?.events,
    cacheId,
    chainId,
    getQueryFilters,
    provider,
  ]);

  return [cache ? fetch : undefined]
}
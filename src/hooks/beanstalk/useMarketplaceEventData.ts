import BigNumber from 'bignumber.js';
import { useCallback, useState, useEffect } from 'react';
import keyBy from 'lodash/keyBy';
import {
  useHistoricalListingsLazyQuery,
  useHistoricalOrdersLazyQuery,
  useMarketplaceEventsLazyQuery,
} from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import { displayBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';

export type MarketEvent = {
  id: string;
  entity: 'listing' | 'order' | 'unknown';
  /** Event action type */
  action: 'create' | 'fill' | 'cancel' | 'unknown';
  /** ex: Pod Order Created */
  label?: string;
  numPods?: BigNumber;
  placeInPodline?: string;
  pricePerPod?: BigNumber;
  totalValue?: BigNumber;
  time?: number;
  /** Txn hash */
  hash: string;
}

export const QUERY_AMOUNT = 50;
export const MAX_TIMESTAMP = '9999999999999'; // 166 455 351 3803

/**
 * Default: queries first 15 events whose timestamp
 * is less than timestamp_lt.
 */
const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  const getUSD = useSiloTokenToFiat();

  ///
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /// Queries
  const [getEvents, eventsQuery] = useMarketplaceEventsLazyQuery({
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {
      events_first: QUERY_AMOUNT,
      events_timestamp_lt: MAX_TIMESTAMP,
    },
  });
  const [getOrders, ordersQuery] = useHistoricalOrdersLazyQuery({
    fetchPolicy: 'network-only'
  });
  const [getListings, listingsQuery] = useHistoricalListingsLazyQuery({
    fetchPolicy: 'network-only'
  });

  const error = (
    eventsQuery.error
    || ordersQuery.error
    || listingsQuery.error
  );

  const _fetch = useCallback(async (first: number, after: string) => {
    setLoading(true);
    setPage((p) => p + 1);
    const result = await getEvents({ variables: { events_first: first, events_timestamp_lt: after } });

    // run join query if we loaded more market events
    if (result.data?.marketplaceEvents.length) {
      // find IDs to join against
      const [orderIDs, listingIDs] = result.data.marketplaceEvents.reduce<[string[], string[]]>((prev, curr) => {
        if (curr.__typename === 'PodOrderFilled' || curr.__typename === 'PodOrderCancelled') {
          prev[0].push(curr.historyID);
        } else if (curr.__typename === 'PodListingFilled' || curr.__typename === 'PodListingCancelled') {
          prev[1].push(curr.historyID);
        }
        return prev;
      }, [[], []]);

      // lookup all of the orders and listings needed to join to the above query
      await Promise.all([
        getOrders({
          variables: { 
            historyIDs: orderIDs,
          }
        }),
        getListings({
          variables: { 
            historyIDs: listingIDs,
          }
        }),
      ]);
    }

    setLoading(false);
  }, [getEvents, getListings, getOrders]);

  const fetchMoreData = useCallback(async () => {
    // look up the next set of marketplaceEvents using the last known timestamp
    const first = QUERY_AMOUNT;
    const after = (
      eventsQuery.data?.marketplaceEvents?.length
        ? eventsQuery.data?.marketplaceEvents[eventsQuery.data?.marketplaceEvents.length - 1].createdAt
        : MAX_TIMESTAMP
    );
    console.debug('Fetch more: ', first, after);
    await _fetch(first, after);
  }, [_fetch, eventsQuery.data?.marketplaceEvents]);

  // when all queries finish, process data
  useEffect(() => {
    const events = eventsQuery.data?.marketplaceEvents;
    if (!loading && events?.length) {
      const podOrdersById = keyBy(ordersQuery.data?.podOrders, 'historyID');
      const podListingsById = keyBy(listingsQuery.data?.podListings, 'historyID');

      const parseEvent = (e: typeof events[number]) => {
        switch (e.__typename) {
          case 'PodOrderCreated':
            return {
              id: e.id,
              hash: e.hash,
              entity: 'order' as const,
              action: 'create' as const,
              label: 'Pod Order Created',
              numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
              placeInPodline: `0 - ${displayBN(toTokenUnitsBN(e.maxPlaceInLine, BEAN[1].decimals))}`,
              pricePerPod: toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals))),
              time: e.createdAt,
            };
          case 'PodOrderCancelled': {
            const podOrder = podOrdersById[e.historyID];
            return {
              id: e.id,
              hash: e.hash,
              entity: 'order' as const,
              action: 'cancel' as const,
              label: 'Pod Order Cancelled',
              numPods: toTokenUnitsBN(podOrder?.podAmount, BEAN[1].decimals),
              placeInPodline: `0 - ${displayBN(toTokenUnitsBN(podOrder?.maxPlaceInLine, BEAN[1].decimals))}`,
              pricePerPod: toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(
                podOrder?.podAmount, BEAN[1].decimals
              )?.multipliedBy(
                toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals)
              )),
              time: e.createdAt,
            };
          }
          case 'PodOrderFilled': {
            const podOrder = podOrdersById[e.historyID];
            return {
              id: e.id,
              hash: e.hash,
              entity: 'order' as const,
              action: 'fill' as const,
              label: 'Pod Order Filled',
              numPods: toTokenUnitsBN(podOrder?.podAmountFilled, BEAN[1].decimals),
              placeInPodline: displayBN(toTokenUnitsBN(new BigNumber(e.index), BEAN[1].decimals).minus(harvestableIndex)),
              pricePerPod: toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(
                podOrder?.podAmountFilled, BEAN[1].decimals
              )?.multipliedBy(toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals))),
              time: e.createdAt,
            };
          }
          case 'PodListingCreated': {
            return {
              id: e.id,
              hash: e.hash,
              entity: 'listing' as const,
              action: 'create' as const,
              label: 'Pod Listing Created',
              numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
              placeInPodline: `${displayBN(toTokenUnitsBN(e.index, BEAN[1].decimals).minus(harvestableIndex))}`,
              pricePerPod: toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals))),
              time: e.createdAt,
            };
          }
          case 'PodListingCancelled': {
            const podListing = podListingsById[e.historyID];
            return {
              id: e.id,
              hash: e.hash,
              entity: 'listing' as const,
              action: 'cancel' as const,
              label: 'Pod Listing Cancelled',
              numPods: toTokenUnitsBN(podListing?.amount, BEAN[1].decimals),
              placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
              pricePerPod: toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(podListing?.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals))),
              time: e.createdAt,
            };
          }
          case 'PodListingFilled': {
            const podListing = podListingsById[e.historyID];
            return {
              id: e.id,
              hash: e.hash,
              entity: 'listing' as const,
              action: 'fill' as const,
              label: 'Pod Listing Filled',
              numPods: toTokenUnitsBN(podListing?.filledAmount, BEAN[1].decimals),
              placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
              pricePerPod: toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals),
              totalValue: getUSD(BEAN[1], toTokenUnitsBN(podListing?.filledAmount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals))),
              time: e.createdAt,
            };
          }
          default: {
            return {
              id: e.id,
              hash: e.hash,
              entity: 'unknown' as const,
              action: 'unknown' as const,
            };
          }
        }
      };

      const _data : MarketEvent[] = [];
      const _max = Math.min(events.length, QUERY_AMOUNT * page);
      for (let i = 0; i < _max; i += 1)  {
        _data.push(parseEvent(events[i]));
      }

      setData(_data);
    }
  }, [
    getUSD, 
    harvestableIndex, 
    loading, 
    eventsQuery.data, 
    listingsQuery.data, 
    ordersQuery.data,
    page,
  ]);

  // kick things off
  useEffect(() => {
    _fetch(QUERY_AMOUNT, MAX_TIMESTAMP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    harvestableIndex,
    loading,
    error,
    fetchMoreData,
    page
  };
};

export default useMarketplaceEventData;

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
  entity: 'listing' | 'order' | 'fill order' | 'fill listing' | 'unknown';
  /** Event action type */
  action: 'create' | 'cancel' | 'unknown' | 'buy' | 'sell';
  /** ex: Pod Order Created */
  label?: string;
  numPods?: BigNumber;
  placeInPodline?: string;
  pricePerPod?: BigNumber;
  totalBeans?: BigNumber;
  totalValue?: BigNumber;
  createdAt?: number;
  /** Txn hash */
  hash: string;
};

export const QUERY_AMOUNT = 500;
export const MAX_TIMESTAMP = '9999999999999'; // 166 455 351 3803

/**
 * Load historical market activity. This merges raw event date from `eventsQuery`
 * with parsed data from `ordersQuery` and `listingsQuery`.
 */
const useMarketActivityData = () => {
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

      // FIXME:
      // This duplicates logic from `castPodListing` and `castPodOrder`.
      // The `marketplaceEvent` entity contains partial information about
      // Orders and Listings during Creation, but NO information during cancellations
      // and fills. In both cases, casting doesn't work because of missing data. 
      const parseEvent = (e: typeof events[number]) => {
        switch (e.__typename) {
          case 'PodOrderCreated': {
            const pricePerPod = toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals);
            const amountPods = toTokenUnitsBN(e.amount, BEAN[1].decimals);
            const placeInLine = toTokenUnitsBN(e.maxPlaceInLine, BEAN[1].decimals);        
            const totalBeans = amountPods.multipliedBy(pricePerPod);
            return {
              id: e.id,
              hash: e.hash,
              entity: 'order' as const,
              action: 'create' as const,
              label: 'Pod Order Created',
              numPods: amountPods,
              placeInPodline: `0 - ${displayBN(placeInLine)}`,
              pricePerPod: pricePerPod,
              totalBeans,
              totalValue: getUSD(BEAN[1], totalBeans),
              createdAt: e.createdAt,
            };
          }
          case 'PodOrderCancelled': {
            const podOrder = podOrdersById[e.historyID];
            const podAmount = podOrder ? toTokenUnitsBN(podOrder.podAmount || 0, BEAN[1].decimals) : undefined;
            const pricePerPod = podOrder ? toTokenUnitsBN(new BigNumber(podOrder.pricePerPod || 0), BEAN[1].decimals) : undefined;
            const totalBeans = podAmount && pricePerPod
              ? podAmount.multipliedBy(pricePerPod)
              : undefined;
              
          return {
              id: e.id,
              hash: e.hash,
              entity: 'order' as const,
              action: 'cancel' as const,
              type: 'order' as const,
              label: 'Pod Order Cancelled',
              numPods: toTokenUnitsBN(podOrder?.podAmount, BEAN[1].decimals),
              placeInPodline: podOrder?.maxPlaceInLine > 0 ? `0 - ${displayBN(toTokenUnitsBN(podOrder?.maxPlaceInLine, BEAN[1].decimals))}` : '-',
              pricePerPod: toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals),
              totalBeans,
              totalValue: totalBeans ? getUSD(BEAN[1], totalBeans) : undefined,
              createdAt: e.createdAt,
            };
          }
          case 'PodOrderFilled': {
            const podOrder = podOrdersById[e.historyID];
            const pricePerPod = toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals);
            const podAmountFilled = toTokenUnitsBN(podOrder?.podAmountFilled, BEAN[1].decimals);
            const totalBeans =  getUSD(BEAN[1], podAmountFilled?.multipliedBy(pricePerPod));
            return {
              id: e.id,
              hash: e.hash,
              entity: 'fill order' as const,
              action: 'sell' as const,
              label: 'Pod Order Filled',
              numPods: podAmountFilled,
              placeInPodline: displayBN(toTokenUnitsBN(new BigNumber(e.index), BEAN[1].decimals).minus(harvestableIndex)),
              pricePerPod: pricePerPod,
              totalBeans,
              totalValue: getUSD(BEAN[1], totalBeans),
              createdAt: e.createdAt,
            };
          }
          case 'PodListingCreated': {
            const numPods = toTokenUnitsBN(e.amount, BEAN[1].decimals);
            const pricePerPod = toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals);
            const totalBeans = numPods.multipliedBy(pricePerPod);
            return {
              id: e.id,
              hash: e.hash,
              entity: 'listing' as const,
              action: 'create' as const,
              label: 'Pod Listing Created',
              numPods: numPods,
              placeInPodline: displayBN(toTokenUnitsBN(e.index, BEAN[1].decimals).minus(harvestableIndex)),
              pricePerPod: pricePerPod,
              totalBeans,
              totalValue: getUSD(BEAN[1], totalBeans),
              createdAt: e.createdAt,
            };
          }
          case 'PodListingCancelled': {
            const podListing = podListingsById[e.historyID];
            const numPods = toTokenUnitsBN(podListing?.amount, BEAN[1].decimals);
            const pricePerPod = toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals);
            const totalBeans = numPods.multipliedBy(pricePerPod);
            return {
              id: e.id,
              hash: e.hash,
              entity: 'listing' as const,
              action: 'cancel' as const,
              label: 'Pod Listing Cancelled',
              numPods: numPods,
              placeInPodline: displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex)),
              pricePerPod: pricePerPod,
              totalBeans,
              totalValue: getUSD(BEAN[1], totalBeans),
              createdAt: e.createdAt,
            };
          }
          case 'PodListingFilled': {
            const podListing = podListingsById[e.historyID];
            const numPodsFilled = toTokenUnitsBN(podListing?.filledAmount, BEAN[1].decimals);
            const pricePerPod = toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals);
            const totalBeans = numPodsFilled.multipliedBy(pricePerPod);
            return {
              id: e.id,
              hash: e.hash,
              entity: 'fill listing' as const,
              action: 'buy' as const,
              label: 'Pod Listing Filled',
              numPods: numPodsFilled,
              placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
              pricePerPod: pricePerPod,
              totalBeans,
              totalValue: getUSD(BEAN[1], totalBeans),
              createdAt: e.createdAt,
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

export default useMarketActivityData;

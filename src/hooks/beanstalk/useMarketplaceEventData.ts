import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import {
  useMarketplaceEventsQuery,
} from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import { displayBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';

export type MarketEvent = {
  id?: any;
  /** Event action type */
  action: 'create' | 'fill' | 'cancel' | 'default';
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

/**
 * Default: queries first 15 events whose timestamp
 * is less than timestamp_lt.
 */
const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  const getUSD = useSiloTokenToFiat();

  /// Queries
  const { data: rawEvents, fetchMore, loading, error, } = useMarketplaceEventsQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      first: QUERY_AMOUNT,
      skip: 0,
    },
  });

  const podOrdersById = useMemo(() => {
    if (rawEvents?.podOrders) {
      return rawEvents?.podOrders.reduce((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {} as any);
    }
  }, [rawEvents?.podOrders]);
  
  const podListingsById = useMemo(() => {
    if (rawEvents?.podListings) {
      return rawEvents?.podListings.reduce((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {} as any);
    }
  }, [rawEvents?.podListings]);

  const fetchMoreData = () => {
    const numData = rawEvents?.marketplaceEvents.length;
    if (numData) {
      fetchMore({
        variables: {
          first: QUERY_AMOUNT,
          skip: numData
        }
      });
    }
  };

  console.log('LEN DATA', rawEvents?.marketplaceEvents.length);

  // Temp
  let podListing;
  let podOrder;

  /// Calculations
  const data: MarketEvent[] | undefined = rawEvents?.marketplaceEvents.map((e) => {
    switch (e.__typename) {
      case 'PodOrderCreated':
        return {
          id: e.id,
          action: 'create',
          hash: e.hash,
          label: 'Pod Order Created',
          numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
          placeInPodline: `0 - ${displayBN(toTokenUnitsBN(e.maxPlaceInLine, BEAN[1].decimals))}`,
          pricePerPod: toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals))),
          time: e.timestamp,
        };
      case 'PodOrderCancelled':
        podOrder = podOrdersById[e.orderId];
        console.log('PRICE', new BigNumber(podOrder?.pricePerPod || 0).toNumber());
        return {
          id: e.id,
          action: 'cancel',
          hash: e.hash,
          label: 'Pod Order Cancelled',
          numPods: toTokenUnitsBN(podOrder?.amount, BEAN[1].decimals),
          placeInPodline: `0 - ${displayBN(toTokenUnitsBN(podOrder?.maxPlaceInLine, BEAN[1].decimals))}`,
          pricePerPod: toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(
            podOrder?.amount, BEAN[1].decimals
          )?.multipliedBy(
            toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals)
          )),
          time: e.timestamp,
        };
      case 'PodOrderFilled':
        podOrder = podOrdersById[e.orderID];
        return {
          id: e.id,
          action: 'fill',
          hash: e.hash,
          label: 'Pod Order Filled',
          numPods: toTokenUnitsBN(podOrder?.amount, BEAN[1].decimals),
          placeInPodline: `0 - ${displayBN(toTokenUnitsBN(podOrder?.maxPlaceInLine, BEAN[1].decimals))}`,
          pricePerPod: toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(
            podOrder?.amount, BEAN[1].decimals
          )?.multipliedBy(toTokenUnitsBN(new BigNumber(podOrder?.pricePerPod || 0), BEAN[1].decimals))),
          time: e.timestamp,
        };
      case 'PodListingCreated':
        return {
          id: e.id,
          hash: e.hash,
          action: 'create',
          label: 'Pod Listing Created',
          numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
          placeInPodline: `${displayBN(toTokenUnitsBN(e.index, BEAN[1].decimals).minus(harvestableIndex))}`,
          pricePerPod: toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals))),
          time: e.timestamp,
        };
      case 'PodListingCancelled':
        podListing = podListingsById[`${e.account}-${e.index}`];
        return {
          id: e.id,
          hash: e.hash,
          action: 'cancel',
          label: 'Pod Listing Cancelled',
          numPods: toTokenUnitsBN(podListing?.amount, BEAN[1].decimals),
          placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
          pricePerPod: toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(podListing?.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals))),
          time: e.timestamp,
        };
      case 'PodListingFilled':
        podListing = podListingsById[`${e.from}-${e.index}`];
        if (podListing === undefined) {
          // console.log('FROM', e.from);
          // console.log('INDEX', e.index);
          // console.log('UNDEFINED LISTING', `${e.account}-${e.index}`);
        } else {
          console.log('INDEX', podListing.index);
          console.log('ORIG INDEX', podListing.originalIndex);
        }
        return {
          id: e.id,
          hash: e.hash,
          action: 'fill',
          label: 'Pod Listing Filled',
          numPods: toTokenUnitsBN(podListing?.amount, BEAN[1].decimals),
          placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
          pricePerPod: toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(podListing?.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(new BigNumber(podListing?.pricePerPod || 0), BEAN[1].decimals))),
          time: e.timestamp,
        };
      default:
        return {
          id: e.id,
          hash: e.hash,
          action: 'default',
        };
    }
  });

  return {
    data,
    harvestableIndex,
    loading,
    error,
    fetchMoreData
  };
};

export default useMarketplaceEventData;

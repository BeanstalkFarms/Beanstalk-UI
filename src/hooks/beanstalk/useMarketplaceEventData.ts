import BigNumber from 'bignumber.js';
import { useMarketplaceEventsQuery, usePodListingsQuery, usePodOrdersQuery } from '~/generated/graphql';
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

/**
 * Default: queries first 15 events whose timestamp
 * is less than timestamp_lt.
 */
const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  const getUSD = useSiloTokenToFiat();

  const now = Math.round(Date.now() / 1000).toString();

  /// Queries
  // ALL EVENTS
  const { data: rawEvents, fetchMore, loading, error, } = useMarketplaceEventsQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 500,
      timestamp_lt: now,
    },
  });

  // POD ORDERS
  const { data: podOrders } = usePodOrdersQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 100,
      createdAt_lt: now,
    },
  });

  // POD LISTINGS
  const { data: podListings } = usePodListingsQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    variables: {
      first: 100,
      createdAt_lt: now,
    },
  });

  console.log('pod orders', podOrders);

  const fetchMoreData = () => {
    const numData = rawEvents?.marketplaceEvents.length;
    if (numData) {
      const timestamp_lt = rawEvents?.marketplaceEvents[numData - 1]?.timestamp.toString();
      fetchMore({
        variables: {
          // first: 15,
          timestamp_lt: timestamp_lt
        }
      }).then((d) => console.log('DATA', d));
    }
  };

  // const [ test ] = Promise.all([
  //   rawEvents?.marketplaceEvents.filter((e) => e.__typename === 'PodOrderCancelled').map((e) => {
  //
  //   })
  // ])

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
        podOrder = podOrders?.podOrders.find((p) => e.orderId === p.id);
        return {
          id: e.id,
          action: 'cancel',
          hash: e.hash,
          label: 'Pod Order Cancelled',
          numPods: toTokenUnitsBN(podOrder?.amount, BEAN[1].decimals),
          placeInPodline: `0 - ${displayBN(toTokenUnitsBN(podOrder?.maxPlaceInLine, BEAN[1].decimals))}`,
          pricePerPod: new BigNumber(podOrder?.pricePerPod || 0),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(
            podOrder?.amount, BEAN[1].decimals
          )?.multipliedBy(new BigNumber(podOrder?.pricePerPod || 0))),
          time: e.timestamp,
        };
      case 'PodOrderFilled':
        // podOrder = PodFillOrderData(e.index, e.hash);
        // if (podOrder.data) {
        //   const p = podOrder.data;
        //   return {
        //     id: e.id,
        //     action: 'fill',
        //     hash: e.hash,
        //     label: 'Pod Order Filled',
        //     numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
        //     placeInPodline: `0 - ${displayBN(p.maxPlaceInLine)}`,
        //     pricePerPod: p.pricePerPod,
        //     totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(p.pricePerPod)),
        //     time: e.timestamp,
        //   };
        // }
        return {
          id: e.id,
          hash: e.hash,
          action: 'fill',
          // DUMMY DATA
          label: 'DUMMY Pod Order FILLED',
          numPods: new BigNumber(0),
          placeInPodline: '0 - 100',
          pricePerPod: new BigNumber(0),
          totalValue: new BigNumber(0),
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
        podListing = podListings?.podListings.find((p) => `${e.account}-${e.index}` === p.id);
        return {
          id: e.id,
          hash: e.hash,
          action: 'cancel',
          label: 'Pod Listing Cancelled',
          numPods: new BigNumber(podListing?.pricePerPod || 0),
          placeInPodline: `${displayBN(toTokenUnitsBN(podListing?.index, BEAN[1].decimals).minus(harvestableIndex))}`,
          pricePerPod: new BigNumber(podListing?.pricePerPod || 0),
          totalValue: getUSD(BEAN[1], toTokenUnitsBN(podListing?.amount, BEAN[1].decimals).multipliedBy(new BigNumber(podListing?.pricePerPod || 0))),
          time: e.timestamp,
        };
      case 'PodListingFilled':
        // podListing = PodListingData(e.index);
        // if (podListing.data) {
        //   const p = podListing.data;
        //   return {
        //     id: e.id,
        //     hash: e.hash,
        //     action: 'fill',
        //     label: 'Pod Listing Filled',
        //     numPods: p.pricePerPod,
        //     placeInPodline: `${displayBN(p.placeInLine)}`,
        //     pricePerPod: p.pricePerPod,
        //     totalValue: getUSD(BEAN[1], p.filledAmount.multipliedBy(p.pricePerPod)),
        //     time: e.timestamp,
        //   };
        // }
        return {
          id: e.id,
          hash: e.hash,
          action: 'fill',
          // DUMMY DATA
          label: 'DUMMY Pod LISTING Filled',
          numPods: new BigNumber(0),
          placeInPodline: '0 - 100',
          pricePerPod: new BigNumber(0),
          totalValue: new BigNumber(0),
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

  /// Query status
  // const loading = rawEvents?.loading;
  //   // const error = rawEvents?.error;

  return {
    data,
    harvestableIndex,
    loading,
    error,
    fetchMoreData
  };
};

export default useMarketplaceEventData;

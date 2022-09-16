import BigNumber from 'bignumber.js';
import { useMarketplaceEventsQuery } from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import { displayBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';

export type MarketEvent = {
  id?: any;
  /** Event action type */
  action: 'create' | 'fill' | 'cancel';
  /** ex: Pod Order Created */
  label?: string;
  numPods?: BigNumber;
  placeInPodline?: string;
  pricePerPod?: BigNumber;
  totalValue?: BigNumber;
  time?: string;
  /** Txn hash */
  hash: string;
}

const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  
  /// Queries
  const rawEvents = useMarketplaceEventsQuery({ fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true });
  console.log('RAW EVENTS', rawEvents.data);
  
  /// Calculations
  const data: MarketEvent[] | undefined = rawEvents.data?.marketplaceEvents.map((e) => {
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
          totalValue: toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals)),
          time: e.timestamp,
        };
      case 'PodOrderCancelled':
        return {
          id: e.id,
          hash: e.hash,
          action: 'cancel',
        };
      case 'PodOrderFilled':
        return {
          id: e.id,
          hash: e.hash,
          action: 'fill',
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
          totalValue: toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(toTokenUnitsBN(e.pricePerPod, BEAN[1].decimals)),
          time: e.timestamp,
        };
      case 'PodListingCancelled':
        return {
          id: e.id,
          hash: e.hash,
          action: 'cancel',
        };
      case 'PodListingFilled':
        return {
          id: e.id,
          hash: e.hash,
         action: 'fill',
        };
      default:
        return {
          id: e.id,
          hash: e.hash,
          action: 'create',
        };
    }
  });

  /// Query status
  const loading = rawEvents.loading;
  const error   = rawEvents.error;

  return {
    data,
    harvestableIndex,
    loading,
    error,
  };
};

export default useMarketplaceEventData;

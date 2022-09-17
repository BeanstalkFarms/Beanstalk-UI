import BigNumber from 'bignumber.js';
import { useMarketplaceEventsQuery } from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import { displayBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import usePodListing from '~/hooks/beanstalk/usePodListing';
import usePodOrder from '~/hooks/beanstalk/usePodOrder';

const PodListingData = (index: string) => {
  const data = usePodListing(index);
  return data;
};

const PodOrderData = (id: string) => {
  const data = usePodOrder(id);
  return data;
};

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
  time?: string;
  /** Txn hash */
  hash: string;
}

const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();

  /// Queries
  const rawEvents = useMarketplaceEventsQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  });
  
  let podListing;
  let podOrder;

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
        podListing = PodListingData(e.index);
        if (podListing.data) {
          const p = podListing.data;
          return {
            id: e.id,
            hash: e.hash,
            action: 'cancel',
            label: 'Pod Listing Cancelled',
            numPods: p.pricePerPod,
            placeInPodline: `${displayBN(p.placeInLine)}`,
            pricePerPod: p.pricePerPod,
            totalValue: p.amount.multipliedBy(p.pricePerPod),
            time: e.timestamp,
          };
        }
        return {
          id: e.id,
          hash: e.hash,
          action: 'default',
        };
      case 'PodListingFilled':
        podListing = PodListingData(e.index);
        if (podListing.data) {
          const p = podListing.data;
          return {
            id: e.id,
            hash: e.hash,
            action: 'fill',
            label: 'Pod Listing Filled',
            numPods: p.pricePerPod,
            placeInPodline: `${displayBN(p.placeInLine)}`,
            pricePerPod: p.pricePerPod,
            totalValue: p.filledAmount.multipliedBy(p.pricePerPod),
            time: e.timestamp,
          };
        }
        return {
          id: e.id,
          hash: e.hash,
          action: 'default',
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
  const error = rawEvents.error;

  return {
    data,
    harvestableIndex,
    loading,
    error,
  };
};

export default useMarketplaceEventData;

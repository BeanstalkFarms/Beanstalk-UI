import BigNumber from 'bignumber.js';
import { useMarketplaceEventsQuery } from '~/generated/graphql';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import { displayBN, toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';
import usePodListing from '~/hooks/beanstalk/usePodListing';
import { BEANSTALK_ADDRESSES } from '~/constants';
import usePodFillOrder from '~/hooks/beanstalk/usePodFillOrder';
import usePodOrder from '~/hooks/beanstalk/usePodOrder';
import useSiloTokenToFiat from '~/hooks/beanstalk/useSiloTokenToFiat';

/// Individual Event Queries
const PodListingData = (index: string) => usePodListing(index);
const PodOrderData = (id: string) => usePodOrder(id);
const PodFillOrderData = (index: string, hash: string) => usePodFillOrder(`${BEANSTALK_ADDRESSES[1]}-${index}-${hash}`);

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

const useMarketplaceEventData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  const getUSD = useSiloTokenToFiat();

  /// Queries
  const rawEvents = useMarketplaceEventsQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  });
  
  // Temp
  let podListing;
  let podOrder;

  /// Calculations
  const data: MarketEvent[] | undefined = rawEvents.data?.marketplaceEvents.map((e) => {
    console.log('TIMESTAMP', e.timestamp);
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
        podOrder = PodOrderData(e.orderId);
        if (podOrder.data) {
          const p = podOrder.data;
          return {
            id: e.id,
            action: 'cancel',
            hash: e.hash,
            label: 'Pod Order Cancelled',
            numPods: p.totalAmount,
            placeInPodline: `0 - ${displayBN(p.maxPlaceInLine)}`,
            pricePerPod: p.pricePerPod,
            totalValue: getUSD(BEAN[1], p.totalAmount?.multipliedBy(p.pricePerPod)),
            time: e.timestamp,
          };
        }
        return {
          id: e.id,
          hash: e.hash,
          action: 'default',
        };
      case 'PodOrderFilled':
        podOrder = PodFillOrderData(e.index, e.hash);
        if (podOrder.data) {
          const p = podOrder.data;
          return {
            id: e.id,
            action: 'fill',
            hash: e.hash,
            label: 'Pod Order Filled',
            numPods: toTokenUnitsBN(e.amount, BEAN[1].decimals),
            placeInPodline: `0 - ${displayBN(p.maxPlaceInLine)}`,
            pricePerPod: p.pricePerPod,
            totalValue: getUSD(BEAN[1], toTokenUnitsBN(e.amount, BEAN[1].decimals).multipliedBy(p.pricePerPod)),
            time: e.timestamp,
          };
        }
        return {
          id: e.id,
          hash: e.hash,
          action: 'default',
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
            totalValue: getUSD(BEAN[1], p.amount.multipliedBy(p.pricePerPod)),
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
            totalValue: getUSD(BEAN[1], p.filledAmount.multipliedBy(p.pricePerPod)),
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
          action: 'default',
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

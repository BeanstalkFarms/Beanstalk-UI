import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { MarketStatus, useAllPodOrdersQuery } from '~/generated/graphql';
import useCastApolloQuery from '~/hooks/app/useCastApolloQuery';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import usePodListings from '~/hooks/beanstalk/usePodListings';
import { castPodListing, castPodOrder, PodListing, PodOrder } from '~/state/farmer/market';

const useMarketData = () => {
  /// Beanstalk data
  const harvestableIndex = useHarvestableIndex();
  
  /// Queries
  const listingsQ = usePodListings({ variables: { status: MarketStatus.Active, }, fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true });
  const ordersQ   = useAllPodOrdersQuery({ variables: { status: MarketStatus.Active }, fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true  });
  
  /// Cast query data to BigNumber, etc.
  const listings = useCastApolloQuery<PodListing>(listingsQ, 'podListings', (_listing) => castPodListing(_listing, harvestableIndex));
  const orders   = useCastApolloQuery<PodOrder>(ordersQ, 'podOrders', castPodOrder);
  
  /// Calculations
  const maxPlaceInLine = useMemo(() => (
    listings
      ? Math.max(...listings.map((l) => new BigNumber(l.index).minus(harvestableIndex).toNumber())) 
      : 0
  ), [harvestableIndex, listings]);
  const maxPlotSize = useMemo(() => (
    listings
      ? Math.max(...listings.map((l) => new BigNumber(l.remainingAmount).toNumber()))
      : 0
  ), [listings]);

  /// Query status
  const loading = listingsQ.loading || ordersQ.loading;
  const error   = listingsQ.error   || ordersQ.error;

  return {
    listings,
    orders,
    maxPlaceInLine,
    maxPlotSize,
    harvestableIndex,
    loading,
    error,
  };
};

export default useMarketData;

import { useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import keyBy from 'lodash/keyBy';
import useCastApolloQuery from '~/hooks/app/useCastApolloQuery';
import {
  PodListing,
  castPodListing,
  PodOrder,
  castPodOrder,
} from '~/state/farmer/market';
import {
  MarketStatus,
  useFarmerPodListingsLazyQuery,
  useFarmerPodOrdersLazyQuery,
} from '../../../generated/graphql';

import useAccount from '~/hooks/ledger/useAccount';
import { AppState } from '~/state';
import useHarvestableIndex from '../../beanstalk/useHarvestableIndex';
import { ZERO_BN } from '~/constants';

export type FarmerMarketEntity = {
  // Identifiers
  id: string;
  action: 'buy' | 'sell';
  type: 'order' | 'listing';

  // Pricing
  priceType: 'fixed' | 'dynamic';
  pricePerPod: BigNumber;

  /**
   * remaining amount of PODS
   */
  remainingAmount: BigNumber;

  /**
   * total amount of PODS
   */
  numPods: BigNumber;
  
  /**
   * percentage filled
   */
  fillPct: BigNumber;

  /**
   * Total value in beans to 100% fill
   */
  totalBeans: BigNumber;

  // FIX
  _podsTotalAmount: BigNumber;
  _beanTotalAmmount: BigNumber;

  // Derived

  /**
   * type is 'order' => max place in line
   * type is 'listing' => index minus harvestable index
   */
  placeInPodline: BigNumber;
  
  /**
   * type is 'order' => 0 (orders don't have an expiry)
   * type is 'listing' => max harvestable index minus harvestable index
   */
  expiry: BigNumber;
  
  // Metadata
  status: MarketStatus;
  createdAt: string | number | undefined;

  // Source
  order?: PodOrder;
  listing?: PodListing;
};

const QUERY_AMOUNT = 50;

const castOrderToItem = (order: PodOrder): FarmerMarketEntity => ({
  // Identifiers
  id: order.id,
  action: 'buy',
  type: 'order',

  // Pricing
  priceType: 'fixed',
  pricePerPod: order.pricePerPod,

  // Constraints
  expiry: ZERO_BN, // pod orders don't expire
  placeInPodline: order.maxPlaceInLine,

  //
  _podsTotalAmount: order.podAmountRemaining,
  _beanTotalAmmount: order.podAmount.times(order.pricePerPod),
  
  // Amounts
  remainingAmount: order.podAmountRemaining,
  numPods: order.podAmount,
  totalBeans: order.podAmount.times(order.pricePerPod),
  
  // Metadata
  status: order.status,
  createdAt: order.createdAt,
  
  // Computed
  fillPct: order.podAmountFilled.div(order.podAmount).times(100),

  // Source
  order,
});

const castListingToItem = (
  listing: PodListing,
  harvestableIndex: BigNumber
): FarmerMarketEntity => ({
  // Identifiers
  id: listing.id,
  action: 'sell',
  type: 'listing',

  // Pricing
  priceType: 'fixed', // FIX ME this is not correct. It is either 'fixed' or 'dynamic',
  pricePerPod: listing.pricePerPod,

  // Constraints
  expiry: listing.maxHarvestableIndex.minus(harvestableIndex),

  //
  _podsTotalAmount: listing.originalAmount,
  _beanTotalAmmount: listing.originalAmount.times(listing.pricePerPod),

  // Amounts
  remainingAmount: listing.remainingAmount,
  numPods: listing.remainingAmount,
  fillPct: listing.filledAmount.div(listing.remainingAmount).times(100),
  totalBeans: listing.remainingAmount.times(listing.pricePerPod),
  
  // Metadata
  status: listing.status,
  createdAt: listing.createdAt,
  
  // Computed
  placeInPodline: listing.index.minus(harvestableIndex),

  // Source
  listing,
});

export function useFetchFarmerMarketItems() {
  const account = useAccount();
  /// Queries
  const [getListings, listingsQuery] = useFarmerPodListingsLazyQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });
  const [getOrders, ordersQuery] = useFarmerPodOrdersLazyQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });

  const fetch = useCallback(async () => {
    if (!account) return;

    await Promise.all([
      getOrders({
        variables: {
          account: account.toLowerCase(),
          createdAt_gt: 0,
          first: QUERY_AMOUNT,
        },
      }),
      getListings({
        variables: {
          account: account.toLowerCase(),
          createdAt_gt: 0,
          first: QUERY_AMOUNT,
        },
      }),
    ]);
  }, [account, getListings, getOrders]);

  return { listings: listingsQuery, orders: ordersQuery, fetch };
}

export default function useFarmerMarket() {
  /// Beanstalk Data
  const harvestableIndex = useHarvestableIndex();

  /// State
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>((state) => state._farmer.market.orders);
  const listings = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);

  const { listings: listingsQuery, orders: ordersQuery, fetch } = useFetchFarmerMarketItems();

  /// cast query data to proper types
  const listingsData = useCastApolloQuery<PodListing>(
    listingsQuery,
    'podListings',
    (_podListing) => castPodListing(_podListing, harvestableIndex)
  );
  const ordersData = useCastApolloQuery<PodOrder>(
    ordersQuery,
    'podOrders',
    castPodOrder
  );

  const isLoading = listingsQuery.loading || ordersQuery.loading;
  const error = listingsQuery.error || ordersQuery.error;

  const farmerMarketItems = useMemo(() => {
    const items: FarmerMarketEntity[] = [];
    if (isLoading) return items;
    const ordersById = keyBy(ordersData, 'id');
    const listingsById = keyBy(listingsData, 'id');

    // use listings and orders in redux store as a fallback
    const allOrderIds = new Set([
      ...Object.keys(ordersById),
      ...Object.keys(orders),
    ]);
    const allListingIds = new Set([
      ...Object.keys(listingsById),
      ...Object.keys(listings),
    ]);

    allOrderIds.forEach((id) => {
      const _order = ordersById[id] ? ordersById[id] : orders[id];
      items.push(castOrderToItem(_order));
    });

    allListingIds.forEach((id) => {
      const _listing = listingsById[id] ? listingsById[id] : listings[id];
      items.push(castListingToItem(_listing, harvestableIndex));
    });

    return items;
  }, [harvestableIndex, isLoading, listings, listingsData, orders, ordersData]);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: farmerMarketItems, error, loading: isLoading };
}

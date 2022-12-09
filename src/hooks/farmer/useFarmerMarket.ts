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
} from '../../generated/graphql';

import useAccount from '~/hooks/ledger/useAccount';
import { AppState } from '~/state';
import useHarvestableIndex from '../beanstalk/useHarvestableIndex';
import { ZERO_BN } from '~/constants';

export type FarmerMarketItem = {
  /**
   * Date of the event
   */
  time: string | number | undefined;
  /**
   * Action of the event
   */
  action: 'buy' | 'sell';
  /**
   *
   */
  type: 'order' | 'listing';
  /**
   *
   */
  priceType: 'fixed' | 'dynamic';
  /**
   *
   */
  pricePerPod: BigNumber;
  /**
   * remaining amount of PODS
   */
  remainingAmount: BigNumber;
  /**
   * type is 'order' => max place in line
   * type is 'listing' => index minus harvestable index
   */
  placeInPodline: BigNumber;
  /**
   * total amount of PODS
   */
  numPods: BigNumber;
  /**
   * type is 'order' => 0 (orders don't have an expiry)
   * type is 'listing' => max harvestable index minus harvestable index
   */
  expiry: BigNumber;
  /**
   * percentage filled
   */
  fillPct: BigNumber;
  /**
   * total value in beans to 100% fill
   */
  totalBeans: BigNumber;
  /**
   * status of the order or listing
   */
  status: MarketStatus;
};

const QUERY_AMOUNT = 50;

const castOrderToItem = (order: PodOrder): FarmerMarketItem => ({
    time: order.createdAt,
    action: 'buy',
    type: 'order',
    priceType: 'fixed',
    pricePerPod: order.pricePerPod,
    remainingAmount: order.remainingAmount.div(order.pricePerPod),
    placeInPodline: order.maxPlaceInLine,
    numPods: order.totalAmount,
    expiry: ZERO_BN, // pod orders don't expire
    fillPct: order.filledAmount.div(order.totalAmount).times(100),
    totalBeans: order.remainingAmount,
    status: order.status,
  });

const castListingToItem = (listing: PodListing, harvestableIndex: BigNumber): FarmerMarketItem => ({
    time: listing.createdAt,
    action: 'sell',
    type: 'listing',
    priceType: 'fixed', // FIX ME this is not correct. It is either 'fixed' or 'dynamic',
    pricePerPod: listing.pricePerPod,
    remainingAmount: listing.remainingAmount,
    placeInPodline: listing.index.minus(harvestableIndex),
    numPods: listing.amount.times(listing.pricePerPod),
    expiry: listing.maxHarvestableIndex.minus(harvestableIndex),
    fillPct: listing.filledAmount.div(listing.amount).times(100),
    totalBeans: listing.remainingAmount.times(listing.pricePerPod),
    status: listing.status,

  });

export default function useFarmerMarket() {
  /// Beanstalk Data
  const harvestableIndex = useHarvestableIndex();
  const account = useAccount();

  /// State
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>((state) => state._farmer.market.orders);
  const listings = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);

  /// Queries
  const [getListings, listingsQuery] = useFarmerPodListingsLazyQuery({ fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true  });
  const [getOrders, ordersQuery] = useFarmerPodOrdersLazyQuery({ fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true });

  /// cast query data to proper types
  const listingsData = useCastApolloQuery<PodListing>(listingsQuery, 'podListings', (_podListing) => castPodListing(_podListing, harvestableIndex));
  const ordersData = useCastApolloQuery<PodOrder>(ordersQuery, 'podOrders', castPodOrder);

  const isLoading = listingsQuery.loading || ordersQuery.loading;
  const error = listingsQuery.error || ordersQuery.error;

  const _fetch = useCallback(async () => {
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

  const farmerMarketItems = useMemo(() => {
    const items: FarmerMarketItem[] = [];
    if (isLoading) return items;
    const ordersById = keyBy(ordersData, 'id');
    const listingsById = keyBy(listingsData, 'id');
    
    // use listings and orders in redux store as a fallback
    const allOrderIds = new Set([...Object.keys(ordersById), ...Object.keys(orders)]);
    const allListingIds = new Set([...Object.keys(listingsById), ...Object.keys(listings)]);

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
    _fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data: farmerMarketItems, error, loading: isLoading };
}

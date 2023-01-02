import { useCallback, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import useCastApolloQuery from '~/hooks/app/useCastApolloQuery';
import {
  PodListing,
  castPodListing,
  PodOrder,
  castPodOrder,
  PricingTypes,
  PricingFunctions,
} from '~/state/farmer/market';
import {
  MarketStatus,
  useFarmerPodListingsQuery,
  useFarmerPodOrdersQuery,
} from '../../../generated/graphql';

import useAccount from '~/hooks/ledger/useAccount';
import useHarvestableIndex from '../../beanstalk/useHarvestableIndex';
import { ZERO_BN } from '~/constants';

/**
 * A single interface for items in the "Your Orders" tab.
 */
export type FarmerMarketHistoryItem = {
  /// ///////////// Identifiers ////////////////

  id: string;
  action: 'buy' | 'sell';
  type: 'order' | 'listing';
  source: PodListing | PodOrder;

  /// ///////////// Pricing ////////////////

  pricingType: PricingTypes;
  pricePerPod: BigNumber;
  pricingFunction: PricingFunctions;

  /// ///////////// Columns ////////////////

  /**
   * Order: # of Pods that could be acquired if the Order is completely Filled
   * Listing: # of Pods in the initial listing
   */
  amountPods: BigNumber;

  /**
   * Order: # of Beans that were put into the order initially
   * Listing: # of Beans that could be received if Listing is completely Filled
   */
  amountBeans: BigNumber;

  /**
   * Order: 0 to `max place in line`
   * Listing': `index - harvestable index`
   */
  placeInLine: BigNumber;
  
  /**
   * Percentage filled.
   */
  fillPct: BigNumber;
  
  /**
   * Order: 0 (orders don't have an expiry)
   * Listing: max harvestable index minus harvestable index
   */
  expiry: BigNumber;
  
  /// ///////////// Metadata ////////////////

  status: MarketStatus;
  createdAt: string | number | undefined;
};

const castOrderToHistoryItem = (order: PodOrder): FarmerMarketHistoryItem => ({
  // Identifiers
  id: order.id,
  action: 'buy',
  type: 'order',
  source: order,

  // Pricing
  pricingType: order.pricingType,
  pricePerPod: order.pricePerPod,
  pricingFunction: null,

  // Columns
  amountPods: order.podAmountRemaining,
  amountBeans: order.podAmount.times(order.pricePerPod),
  placeInLine: order.maxPlaceInLine,
  fillPct: order.podAmountFilled.div(order.podAmount).times(100),
  expiry: ZERO_BN, // pod orders don't expire
  
  // Metadata
  status: order.status,
  createdAt: order.createdAt,
});

const castListingToHistoryItem = (listing: PodListing): FarmerMarketHistoryItem => ({
  // Identifiers
  id: listing.id,
  action: 'sell',
  type: 'listing',
  source: listing,

  // Pricing
  pricingType: listing.pricingType,
  pricePerPod: listing.pricePerPod,
  pricingFunction: null,

  // Columns
  amountPods: listing.originalAmount,
  amountBeans: listing.originalAmount.times(listing.pricePerPod),
  placeInLine: listing.placeInLine,
  fillPct: listing.filledAmount.div(listing.originalAmount).times(100),
  expiry: listing.expiry,
  
  // Metadata
  status: listing.status,
  createdAt: listing.createdAt,
});

const QUERY_AMOUNT = 1000;

export default function useFarmerMarket() {
  const account = useAccount();
  const harvestableIndex = useHarvestableIndex();

  // Queries
  const listingsQuery = useFarmerPodListingsQuery({
    variables: {
      account: account?.toLowerCase() || '',
      createdAt_gt: 0,
      first: QUERY_AMOUNT,
    },
    skip: !account,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });
  const ordersQuery = useFarmerPodOrdersQuery({
    variables: {
      account: account?.toLowerCase() || '',
      createdAt_gt: 0,
      first: QUERY_AMOUNT,
    },
    skip: !account,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
  });

  // Cast query data to decimal form
  const listingItems = useCastApolloQuery<FarmerMarketHistoryItem>(
    listingsQuery,
    'podListings',
    useCallback((l) => castListingToHistoryItem(castPodListing(l, harvestableIndex)), [harvestableIndex]),
  );
  const orderItems = useCastApolloQuery<FarmerMarketHistoryItem>(
    ordersQuery,
    'podOrders',
    useCallback((o) => castOrderToHistoryItem(castPodOrder(o)), []),
  );

  console.debug(listingsQuery, ordersQuery);

  // Cast query data to history item form
  const data = useMemo(() => {
    // shortcut to check if listings / orders are still loading
    if (!listingItems || !orderItems) return [];
    return [
      ...listingItems,
      ...orderItems,
    ];
  }, [listingItems, orderItems]);

  return {
    data,
    loading: listingsQuery.loading || ordersQuery.loading,
  };
}

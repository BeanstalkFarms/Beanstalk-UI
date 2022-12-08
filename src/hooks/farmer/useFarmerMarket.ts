import BigNumber from 'bignumber.js';
import { Bytes } from 'ethers';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { toTokenUnitsBN } from '~/util';
import { BEAN } from '~/constants/tokens';

type IPodOrder = {
  id: string;
  historyID: string;
  account: string;
  createdAt: string;
  updatedAt: string;
  status: MarketStatus;
  // # Order; data
  podAmount: BigNumber;
  beanAmount: BigNumber;
  podAmountFilled: BigNumber;
  beanAmountFilled: BigNumber;
  minFillAmount: BigNumber;
  maxPlaceInLine: BigNumber;
  pricePerPod: BigNumber;
  pricingFunction: Bytes | null;
  pricingType: number | null;
};

type IPodListing = {
  id: string;
  account: string;
  historyID: string;
  createdAt: string;
  updatedAt: string;
  status: MarketStatus;

  originalIndex: BigNumber;
  index: BigNumber;
  start: BigNumber;
  amount: BigNumber;
  originalAmount: BigNumber;
  remainingAmount: BigNumber;
  filledAmount: BigNumber;
  filled: BigNumber;
  cancelledAmount: BigNumber;
  pricePerPod: BigNumber;
  minFillAmount: BigNumber;
  maxHarvestableIndex: BigNumber;
  pricingFunction: Bytes | null;
  mode: any;
  pricingType: number | null;
};

export type IFarmerMarket = {
  id: string;
};

const printObjArr = (title: string, obj: any[]) => {
  console.log(`------ ${title} ------`);
  obj.forEach((o) => {
    const _obj = Object.entries(o).reduce(
      (prev, [key, value]) => {
        if (value instanceof BigNumber) {
          prev[key] = value.toFixed(2);
          // console.log(`${key}: ${value.toFixed(2)}`);
        } else {
          prev[key] = value;
        }
        return prev;
        // console.log(`${key}: ${value}`);
      },
      { ...o } as any
    );
    console.log(_obj);
  });
};

const beanDecimals = BEAN[1].decimals;
const QUERY_AMOUNT = 50;

export default function useFarmerMarket() {
  /// Beanstalk Data
  const harvestableIndex = useHarvestableIndex();
  const account = useAccount();

  /// State
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>(
    (state) => state._farmer.market.orders
  );
  const listings = useSelector<
    AppState,
    AppState['_farmer']['market']['listings']
  >((state) => state._farmer.market.listings);

  const [marketData, setMarketData] = useState<{
    orders: IPodOrder[] | null;
    listings: IPodListing[] | null;
  }>({ orders: null, listings: null });
  const [loading, setLoading] = useState<boolean>(false);

  /// Queries
  const [getListings, listingsQuery] = useFarmerPodListingsLazyQuery({
    fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true 
  });
  const [getOrders, ordersQuery] = useFarmerPodOrdersLazyQuery({
    fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first', notifyOnNetworkStatusChange: true 
  });

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

  // printObjArr('cast listings data', listingsData ?? []);
  // printObjArr('cast orders data', ordersData ?? []);

  const error = listingsQuery.error || ordersQuery.error;

  const isLoading = listingsQuery.loading || ordersQuery.loading;

  const queryVars = useMemo(() => {
    const _o = ordersQuery?.data?.podOrders.map((o) => o.createdAt);
    const _l = listingsQuery?.data?.podListings.map((l) => l.createdAt);
    // const lastGt = Math.max(..._o);
  }, [ordersQuery?.data, listingsQuery?.data]);

  const _fetch = useCallback(async () => {
    if (!account) return;
    const _l = listingsQuery?.data?.podListings;
    const _o = ordersQuery?.data?.podOrders;
    if (_l && _l?.length > 0 && _l.length < QUERY_AMOUNT) return;
    if (_o && _o?.length > 0 && _o.length < QUERY_AMOUNT) return;
    console.log('fetching...');
    setLoading(true);

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
  }, [
    account,
    getListings,
    getOrders,
    listingsQuery?.data?.podListings,
    ordersQuery?.data?.podOrders,
  ]);

  useEffect(() => {
    if (isLoading) return;
    const _orders: IPodOrder[] = [];
    ordersQuery?.data?.podOrders.forEach((o) => {
      _orders.push({
        id: o.id,
        historyID: o.historyID,
        account: o.farmer.id,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        status: o.status,
        podAmount: toTokenUnitsBN(o.podAmount, beanDecimals),
        beanAmount: toTokenUnitsBN(o.beanAmount, beanDecimals),
        podAmountFilled: toTokenUnitsBN(o.podAmountFilled, beanDecimals),
        beanAmountFilled: toTokenUnitsBN(o.beanAmountFilled, beanDecimals),
        minFillAmount: toTokenUnitsBN(o.minFillAmount, beanDecimals),
        maxPlaceInLine: toTokenUnitsBN(o.maxPlaceInLine, beanDecimals),
        pricePerPod: toTokenUnitsBN(o.pricePerPod, beanDecimals),
        pricingFunction: o?.pricingFunction ?? null,
        pricingType: o?.pricingType ?? null,
      });
    });
    const _listings: IPodListing[] = [];
    listingsQuery?.data?.podListings?.forEach((l) => {
      _listings.push({
        id: l.id,
        historyID: l.historyID,
        account: l.farmer.id,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        status: l.status,
        originalIndex: toTokenUnitsBN(l.originalIndex, beanDecimals),
        index: toTokenUnitsBN(l.index, beanDecimals),
        start: toTokenUnitsBN(l.start, beanDecimals),
        amount: toTokenUnitsBN(l.amount, beanDecimals),
        originalAmount: toTokenUnitsBN(l.originalAmount, beanDecimals),
        remainingAmount: toTokenUnitsBN(l.remainingAmount, beanDecimals),
        filledAmount: toTokenUnitsBN(l.filledAmount, beanDecimals),
        filled: toTokenUnitsBN(l.filled, beanDecimals),
        cancelledAmount: toTokenUnitsBN(l.cancelledAmount, beanDecimals),
        pricePerPod: toTokenUnitsBN(l.pricePerPod, beanDecimals),
        minFillAmount: toTokenUnitsBN(l.minFillAmount, beanDecimals),
        maxHarvestableIndex: toTokenUnitsBN(
          l.maxHarvestableIndex,
          beanDecimals
        ),
        pricingFunction: l?.pricingFunction ?? null,
        mode: undefined,
        pricingType: l?.pricingType ?? null,
      });
    });

    // printObjArr('fetched orders...: ', _orders);
    // printObjArr('fetched listings',_listings);

    setMarketData((prev) => ({
      ...prev.orders,
      orders: _orders && _orders?.length ? _orders : [],
      listings: _listings && _listings?.length ? _listings : [],
    }));
  }, [isLoading, listingsQuery?.data, ordersQuery?.data]);

  // fetch on initial mount
  useEffect(() => {
    _fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log('farmerMarket: ', );

  return { data: marketData, error, loading };
}

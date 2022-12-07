import BigNumber from 'bignumber.js';
import { Bytes } from 'ethers';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
}

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
  pricingFunction: Bytes;
  mode: any;
  pricingType: number;
}

export type IFarmerMarket = {
  id: string;
};

const beanDecimals = BEAN[1].decimals;

export default function useFarmerMarket() {
  /// State
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>(
    (state) => state._farmer.market.orders
  );
  const listings = useSelector<
    AppState,
    AppState['_farmer']['market']['listings']
  >((state) => state._farmer.market.listings);

  const [marketData, setMarketData] = useState<{orders: IPodOrder[], listings: IPodListing[]}>({ orders: [], listings: [] });

  const [loading, setLoading] = useState<boolean>(false);
  // const [cache] = useState<{orders}>()

  // Beanstalk Data
  const harvestableIndex = useHarvestableIndex();
  const account = useAccount();

  // Queries
  const [getListings, listingsQuery] = useFarmerPodListingsLazyQuery({
    fetchPolicy: 'network-only',
  });
  const [getOrders, ordersQuery] = useFarmerPodOrdersLazyQuery({
    fetchPolicy: 'network-only',
  });

  const error = listingsQuery.error || ordersQuery.error;

  const isLoading = listingsQuery.loading || ordersQuery.loading;

  const queryVars = useMemo(() => {
    const _o = ordersQuery?.data?.podOrders.map((o) => o.createdAt);
    const _l = listingsQuery?.data?.podListings.map((l) => l.createdAt);
    // const lastGt = Math.max(..._o);
  }, [ordersQuery?.data, listingsQuery?.data]);

  const _fetch = useCallback(async () => {
    if (!account) return;
    setLoading(true);

    await Promise.all([
      getOrders({
        variables: { account: account.toLowerCase(), createdAt_gt: 0 },
      }),
      getListings({
        variables: { account: account.toLowerCase(), createdAt_gt: 0 },
      }),
    ]);
    setLoading(false);

    // if ()
  }, [account, getListings, getOrders]);

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
        beanAmount: new BigNumber(o.beanAmount),
        podAmountFilled: toTokenUnitsBN(o.podAmountFilled, beanDecimals),
        beanAmountFilled: new BigNumber(o.beanAmountFilled),
        minFillAmount: toTokenUnitsBN(o.minFillAmount, beanDecimals),
        maxPlaceInLine: toTokenUnitsBN(o.maxPlaceInLine, beanDecimals),
        pricePerPod: toTokenUnitsBN(o.pricePerPod, beanDecimals),
        pricingFunction: o?.pricingFunction ?? null,
        pricingType: o?.pricingType ?? null,
      });
    });
    setMarketData((prev) => ({ ...prev, orders: _orders }));
  }, [isLoading, listingsQuery.data, ordersQuery?.data]);

  // fetch on initial mount
  useEffect(() => {
    _fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('farmerMarket: ', marketData);

  return { data: marketData, error, loading };
}

import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ZERO_BN } from '~/constants';
import { MarketStatus } from '~/generated/graphql';
import { AppState } from '~/state';
import useHarvestableIndex from '../beanstalk/useHarvestableIndex';

export type IFarmerMarketEvent = {
  /**
   * Date of the event
   */
  time: string | number;
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

export default function useFarmerMarketplaceEvents() {
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>(
    (state) => state._farmer.market.orders
  );
  const listings = useSelector<
    AppState,
    AppState['_farmer']['market']['listings']
  >((state) => state._farmer.market.listings);

  const harvestableIndex = useHarvestableIndex();

  return useMemo(() => {
    const activity: IFarmerMarketEvent[] = [];
    const now = new Date();
    if (!orders && !listings) return activity;
    Object.values(orders).forEach((o) => {
      activity.push({
        time: now.getTime(), // FIX ME this is not correct. Can we get the date from the order?
        action: 'buy',
        type: 'order',
        priceType: 'fixed', // FIX ME this is not correct. It is either 'fixed' or 'dynamic'
        pricePerPod: o.pricePerPod,
        remainingAmount: o.remainingAmount.div(o.pricePerPod),
        placeInPodline: o.maxPlaceInLine,
        numPods: o.totalAmount,
        expiry: ZERO_BN,
        fillPct: o.filledAmount.div(o.totalAmount).times(100),
        totalBeans: o.remainingAmount,
        status: o.status,
      });
    });
    Object.values(listings).forEach((l) => {
      activity.push({
        time: now.getTime(),
        action: 'sell',
        type: 'listing',
        priceType: 'fixed', // FIX ME this is not correct. It is either 'fixed' or 'dynamic',
        pricePerPod: l.pricePerPod,
        remainingAmount: l.remainingAmount,
        placeInPodline: l.index.minus(harvestableIndex),
        numPods: l.totalAmount.times(l.pricePerPod),
        expiry: l.maxHarvestableIndex.minus(harvestableIndex),
        fillPct: l.filledAmount.div(l.totalAmount).times(100),
        totalBeans: l.remainingAmount.times(l.pricePerPod),
        status: l.status,
      });
    });
    return activity;
  }, [harvestableIndex, listings, orders]);
}

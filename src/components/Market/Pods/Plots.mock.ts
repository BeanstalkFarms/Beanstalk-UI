import BigNumber from 'bignumber.js';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { PodListing, PodOrder } from '~/state/farmer/market';

/**
 * Follows PodListing format at:
 * /src/state/v1/marketplace/reducer.ts
*/
export const mockPodListingData: PodListing[] = new Array(20).fill(null).map((_, i) => {
  const amount = new BigNumber(5000000 * Math.random());
  const index = new BigNumber(100000000 * Math.random());
  return {
    id: i.toString(),
    account: '0X123456789101112131415',
    index: index,
    start: new BigNumber(10000 * Math.random()),
    pricePerPod: new BigNumber(Math.random()),
    maxHarvestableIndex: new BigNumber(10000000 * Math.random()),
    mode: FarmToMode.INTERNAL,
    amount: amount,
    totalAmount: new BigNumber(10000000 * Math.random()),
    remainingAmount: amount,
    filledAmount: new BigNumber(3000000 * Math.random()),
    status: 'active',
    placeInLine: index.minus(50_000_000)
  };
});

/**
 * Follows PodOrder format at:
 * /src/state/v1/marketplace/reducer.ts
*/
export const mockPodOrderData: PodOrder[] = new Array(20).fill(null).map(() => ({
  account: '0X123456789101112131415',
  id: '123456789',
  pricePerPod: new BigNumber(Math.random()),
  maxPlaceInLine: new BigNumber(10000000 * Math.random()),
  totalAmount: new BigNumber(10000000 * Math.random()),
  remainingAmount: new BigNumber(5000000 * Math.random()),
  filledAmount: new BigNumber(3000000 * Math.random()),
  status: 'active',
}));

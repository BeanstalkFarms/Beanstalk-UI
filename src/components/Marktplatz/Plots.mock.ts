import BigNumber from 'bignumber.js';

/**
 * Follows PodListing format at:
 * /src/state/v1/marketplace/reducer.ts
*/
export const mockPodListingData = new Array(20).fill(null).map((_, i) => ({
  id: i,
  account: '0X123456789101112131415',
  index: new BigNumber(100000000 * Math.random()),
  start: new BigNumber(10000 * Math.random()),
  pricePerPod: new BigNumber(Math.random()),
  maxHarvestableIndex: new BigNumber(10000000 * Math.random()),
  toWallet: true,
  totalAmount: new BigNumber(10000000 * Math.random()),
  remainingAmount: new BigNumber(5000000 * Math.random()),
  filledAmount: new BigNumber(3000000 * Math.random()),
  status: 'status',
}));

/**
 * Follows PodOrder format at:
 * /src/state/v1/marketplace/reducer.ts
*/
export const mockPodOrderData = new Array(20).fill(null).map((_, i) => ({
  account: '0X123456789101112131415',
  id: '',
  pricePerPod: new BigNumber(Math.random()),
  maxPlaceInLine: new BigNumber(1000000 * Math.random()),
  totalAmount: new BigNumber(10000000 * Math.random()),
  remainingAmount: new BigNumber(5000000 * Math.random()),
  filledAmount: new BigNumber(3000000 * Math.random()),
  status: 'status',
}));

// order
export const sellRows = new Array(20).fill(null).map((_, i) => (
  {
    id: i,
    placeInLine: '0 - 14,000',
    price: new BigNumber(345345345).multipliedBy(Math.random()),
    podsRequested: new BigNumber(10234234).multipliedBy(Math.random())
  }
));

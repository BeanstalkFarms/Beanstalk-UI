import { BigNumber } from 'bignumber.js';
import { useMemo, useCallback } from 'react';
import { PodListing, PodOrder } from '~/state/farmer/market';
import { ZERO_BN, ONE_BN } from '~/constants';
import useMarketData from './useMarketData';

export type PriceBucket = {
  depth: {
    pods: BigNumber; // depth of pods at price price point
    bean: BigNumber; // depth of beans at price point
  };
  placeInLine: {
    buy: {
      // maximum place in line for buy orders at price point
      max: BigNumber;
      // average place in line for buy orders at price point
      avg: BigNumber;
      // number of buy orders at price point
      count: number;
    };
    sell: {
      // minimum place in line for sell orders at price point
      min: BigNumber;
      // average place in line for sell orders at price point
      avg: BigNumber;
      // number of sell orders at price point
      count: number;
    };
  };
};

// key is the pricePerPod with 2 degrees of precision
export type PriceBuckets = Record<string, PriceBucket>;

export type OrderbookPrecision = 0.1 | 0.05 | 0.01 | 0.02;
export type OrderbookAggregation = 'min-max' | 'avg';

const PRECISION = 2;
const INCRE = new BigNumber(0.01);
// a really big number
const SAFE_MIN = new BigNumber(100_000_000_000_000);
// a really small number
const SAFE_MAX = new BigNumber(-100_000_000_000_000);

const BASE_BUY_FRAGMENT = {
  max: ZERO_BN,
  avg: ZERO_BN,
  count: 0,
};

const BASE_SELL_FRAGMENT = {
  min: ZERO_BN,
  avg: ZERO_BN,
  count: 0,
};

function useBucketMarketData() {
  const initPriceBucket = useCallback(
    (): PriceBucket => ({
      depth: {
        pods: ZERO_BN,
        bean: ZERO_BN,
      },
      placeInLine: {
        buy: {
          ...BASE_BUY_FRAGMENT,
          max: SAFE_MAX,
        },
        sell: {
          ...BASE_SELL_FRAGMENT,
          min: SAFE_MIN,
        },
      },
    }),
    []
  );

  const bucketOrders = useCallback(
    (orders: PodOrder[]) =>
      orders.reduce((prev, order) => {
        const price = order.pricePerPod.toFixed(PRECISION);
        const bucket = prev[price] || initPriceBucket();

        // add to the depth of beans at the price point
        bucket.depth.bean = bucket.depth.bean.plus(order.totalAmount);

        // set the running max place in line for the price point
        bucket.placeInLine.buy.max = BigNumber.max(
          bucket.placeInLine.buy.max,
          order.maxPlaceInLine
        );

        // set the running average place in line for the price point
        const prevAvg = bucket.placeInLine.buy.avg;
        if (prevAvg.eq(0)) {
          bucket.placeInLine.buy.avg = order.maxPlaceInLine;
        } else {
          bucket.placeInLine.buy.avg = prevAvg
            .plus(order.maxPlaceInLine)
            .div(bucket.placeInLine.buy.count + 1);
        }
        // increment the number of orders at the price point
        bucket.placeInLine.buy.count += 1;

        prev = { ...prev, [price]: { ...bucket } };
        return prev;
      }, {} as Record<string, PriceBucket>),
    [initPriceBucket]
  );

  const bucketListings = useCallback(
    (listings: PodListing[]) =>
      listings.reduce((prev, listing) => {
        const price = listing.pricePerPod.toFixed(PRECISION);
        const bucket = prev[price] || initPriceBucket();

        // add to the depth of pods at the price point
        // console.log('listing.amount', listing.amount.toString());
        const podsRemaining = listing.amount.div(listing.pricePerPod);
        bucket.depth.pods = bucket.depth.pods.plus(podsRemaining);
        // // set the running minimum plot index for the price point
        bucket.placeInLine.sell.min = BigNumber.min(
          bucket.placeInLine.sell.min,
          listing.index
        );
        // // set the running average plot index for the price point
        const prevAvg = bucket.placeInLine.sell.avg;
        if (prevAvg.eq(0)) {
          bucket.placeInLine.sell.avg = listing.index;
        } else {
          bucket.placeInLine.sell.avg = prevAvg
            .plus(listing.index)
            .div(bucket.placeInLine.sell.count + 1);
        }
        // increment the number of listings at the price point
        bucket.placeInLine.sell.count += 1;

        prev = { ...prev, [price]: { ...bucket } };
        return prev;
      }, {} as Record<string, PriceBucket>),
    [initPriceBucket]
  );

  return useMemo(
    () => ({
      bucketOrders,
      bucketListings,
      initPriceBucket,
    }),
    [bucketListings, bucketOrders, initPriceBucket]
  );
}

export default function useOrderbook() {
  const { listings, orders, ...other } = useMarketData();
  const { bucketOrders, bucketListings, initPriceBucket } =
    useBucketMarketData();

  const values = useMemo(() => {
    const buckets = {} as PriceBuckets;
    if (!listings?.length || !orders?.length) return buckets;
    const listingBuckets = bucketListings(listings);
    const orderBuckets = bucketOrders(orders);

    const iter = { v: INCRE };

    while (iter.v.lt(ONE_BN)) {
      const priceKey = iter.v.toFixed(PRECISION);
      const bucket = initPriceBucket();

      // merge listings
      if (listingBuckets[priceKey]) {
        if (listingBuckets[priceKey].depth.pods.gt(0)) {
          bucket.depth.pods = listingBuckets[priceKey].depth.pods;
        }
        bucket.placeInLine.sell =
          listingBuckets[priceKey].placeInLine.sell.count > 0
            ? { ...listingBuckets[priceKey].placeInLine.sell }
            : { ...BASE_SELL_FRAGMENT };
      }

      // merge orders
      if (orderBuckets[priceKey]) {
        if (orderBuckets[priceKey].depth.bean) {
          bucket.depth.bean = orderBuckets[priceKey].depth.bean;
        }

        bucket.placeInLine.buy =
          orderBuckets[priceKey].placeInLine.buy.count > 0
            ? { ...orderBuckets[priceKey].placeInLine.buy }
            : { ...BASE_BUY_FRAGMENT };
      }

      iter.v = iter.v.plus(INCRE);
      buckets[priceKey] = { ...bucket };
    }

    return buckets;
  }, [bucketListings, bucketOrders, initPriceBucket, listings, orders]);

  return {
    data: values,
    ...other,
  };
}

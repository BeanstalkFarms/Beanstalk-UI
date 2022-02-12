import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMarketplaceState,
} from 'state/marketplace/actions';
import orderBy from 'lodash/orderBy';
import { EventData } from 'web3-eth-contract';
import {
  beanstalkContractReadOnly,
  toTokenUnitsBN,
} from 'util/index';
import { BEAN } from 'constants/index';
import { PodOrder, PodListing, MarketHistoryItem, MarketStats } from './reducer';

// Pod Listing Events
// These map to the values returned by the Beanstalk contract.
type PodListingCreatedEvent = {
  account: string;
  index: string;
  start: string;
  amount: string;
  pricePerPod: string;
  maxHarvestableIndex: string;
  toWallet: boolean;
}
type PodListingFilledEvent = {
  from: string;
  to: string;
  index: string;
  start: string;
  amount: string;
}
type PodListingCancelledEvent = {
  account: string;
  index: string;
}

// Pod Order Events
// These map to the values returned by the Beanstalk contract.
type PodOrderCreatedEvent = {
  account: string;
  id: string;
  amount: string;
  pricePerPod: string;
  maxPlaceInLine: string;
}
type PodOrderFilledEvent = {
  from: string;
  to: string;
  id: string;
  index: string;
  start: string;
  amount: string;
}
type PodOrderCancelledEvent = {
  account: string;
  id: string;
}

function processEvents(events: EventData[], harvestableIndex: BigNumber) {
  const podListings : { [key: string]: PodListing } = {};
  const podOrders : { [key: string]: PodOrder } = {};
  const marketHistory : MarketHistoryItem[] = [];
  const marketStats : MarketStats = {
    podVolume: new BigNumber(0),
    beanVolume: new BigNumber(0),
    countFills: new BigNumber(0),
    listings: {
      sumRemainingAmount: new BigNumber(0),
    },
    orders: {
      sumRemainingAmount: new BigNumber(0),
    }
  };

  for (const event of events) {
    if (event.event === 'PodListingCreated') {
      const values = (event.returnValues as PodListingCreatedEvent);
      podListings[values.index] = {
        account: values.account,
        index: toTokenUnitsBN(new BigNumber(values.index), BEAN.decimals),
        start: toTokenUnitsBN(new BigNumber(values.start), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(values.pricePerPod), BEAN.decimals),
        maxHarvestableIndex: toTokenUnitsBN(new BigNumber(values.maxHarvestableIndex), BEAN.decimals),
        toWallet: values.toWallet,
        totalAmount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        remainingAmount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        filledAmount: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'PodListingCancelled') {
      const values = (event.returnValues as PodListingCancelledEvent);
      if (podListings[values.index]) delete podListings[values.index];
    } else if (event.event === 'PodListingFilled') {
      const values = (event.returnValues as PodListingFilledEvent);
      if (!podListings[values.index]) continue;
      const amount = toTokenUnitsBN(values.amount, BEAN.decimals);

      // Move current listing's index up by |amount|
      // FIXME: does this match the new marketplace behavior? Believe
      // this assumes we are selling from the front (such that, as a listing
      // is sold, the index increases).
      const prevKey = values.index.toString();
      const currentListing = podListings[prevKey];
      delete podListings[prevKey];

      // The new index of the Plot, now that some of it has been sold.
      const newIndex = new BigNumber(values.index).plus(values.amount).plus(values.start);
      const newKey = newIndex.toString();
      podListings[newKey] = currentListing;

      // 
      const filledBeans = (currentListing.pricePerPod).times(amount);

      // Bump up |amountSold| for this listing
      podListings[newKey].index = toTokenUnitsBN(newIndex, BEAN.decimals);
      podListings[newKey].start = new BigNumber(0);
      podListings[newKey].filledAmount = currentListing.filledAmount.plus(amount);
      podListings[newKey].remainingAmount = currentListing.totalAmount.minus(currentListing.filledAmount);

      // Add to market history
      marketHistory.push({
        // Event info
        type: 'PodListingFilled',
        timestamp: 0,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex,
        transactionHash: event.transactionHash,
        // Amounts
        index: podListings[newKey].index,
        start: podListings[newKey].start, // VERIFY
        amount: amount,
        pricePerPod: podListings[newKey].pricePerPod,
        filledBeans: filledBeans,
        // Parties
        from: values.from,
        to: values.to,
      });

      marketStats.podVolume  = marketStats.podVolume.plus(amount);
      marketStats.beanVolume = marketStats.beanVolume.plus(filledBeans);
      marketStats.countFills = marketStats.countFills.plus(1);

      // Check whether current listing is sold or not
      // FIXME: potential for roundoff error such that remainingAmount < 0?
      const isSold = podListings[newKey].remainingAmount.isEqualTo(0);
      if (isSold) {
        podListings[newKey].status = 'sold';
        delete podListings[newKey];
      }
    } else if (event.event === 'PodOrderCreated') {
      const values = (event.returnValues as PodOrderCreatedEvent);
      podOrders[values.id] = {
        account: values.account,
        id: values.id.toString(),
        maxPlaceInLine: toTokenUnitsBN(new BigNumber(values.maxPlaceInLine), BEAN.decimals),
        totalAmount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(values.pricePerPod), BEAN.decimals),
        remainingAmount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        filledAmount: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'PodOrderCancelled') {
      const values = (event.returnValues as PodOrderCancelledEvent);
      delete podOrders[values.id];
    } else if (event.event === 'PodOrderFilled') {
      const values = (event.returnValues as PodOrderFilledEvent);
      const amount = toTokenUnitsBN(values.amount, BEAN.decimals);

      // Check whether current offer is sold or not
      const key = values.id;
      const podOrder = podOrders[key];
      podOrders[key].filledAmount = podOrder.filledAmount.plus(amount);
      podOrders[key].remainingAmount = podOrder.totalAmount.minus(podOrder.filledAmount);
      
      //
      const filledBeans = podOrders[key].pricePerPod.times(amount);

      // Add to market history
      marketHistory.push({
        // Event info
        type: 'PodOrderFilled',
        timestamp: 0,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex,
        transactionHash: event.transactionHash,
        // Amounts
        index: toTokenUnitsBN(values.index, BEAN.decimals),
        start: toTokenUnitsBN(values.start, BEAN.decimals), // VERIFY
        amount: amount,
        pricePerPod: podOrders[key].pricePerPod,
        filledBeans: filledBeans,
        // Parties
        from: values.from,
        to: values.to,
      });

      marketStats.podVolume  = marketStats.podVolume.plus(amount);
      marketStats.beanVolume = marketStats.beanVolume.plus(filledBeans);
      marketStats.countFills = marketStats.countFills.plus(1);

      const isFilled = podOrder.remainingAmount.isEqualTo(0);
      if (isFilled) {
        delete podOrders[key];
      }
    }
  }

  // Finally, order listings and offers by their index and also mark any that have expired.
  const finalPodListings = orderBy(Object.values(podListings), 'index', 'asc').map((listing) => {
    if (listing.maxHarvestableIndex.isLessThanOrEqualTo(harvestableIndex)) {
      // Don't add to remaining amount since listing has expired.
      return {
        ...listing,
        status: 'expired',
      };
    }
    marketStats.listings.sumRemainingAmount = marketStats.listings.sumRemainingAmount.plus(listing.remainingAmount);
    return listing;
  });
  const finalPodOrders = Object.values(podOrders).map((order) => {
    marketStats.orders.sumRemainingAmount = marketStats.orders.sumRemainingAmount.plus(order.remainingAmount);
    return order;
  });
  const finalMarketHistory = marketHistory.reverse(); 

  return {
    listings: finalPodListings,
    orders: finalPodOrders,
    history: finalMarketHistory,
    stats: marketStats,
  };
}

export default function Updater() {
  const dispatch = useDispatch();

  const { harvestableIndex } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);

  useEffect(() => {
    const fetchMarketplaceListings = async () => {
      const beanstalk = beanstalkContractReadOnly();
      // TODO: Change fromBlock: 0 to the block that BIP-10 is implemented.
      const events : (EventData[])[] = await Promise.all(
        [
          beanstalk.getPastEvents('PodListingCreated', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('PodListingCancelled', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('PodListingFilled', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('PodOrderCreated', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('PodOrderCancelled', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('PodOrderFilled', {
            fromBlock: 0,
          })
        ]
      );
      
      // eslint-disable-next-line
      let marketplaceEvents : EventData[] = [].concat.apply([], events);
      marketplaceEvents.sort((a, b) => {
        const diff = a.blockNumber - b.blockNumber;
        if (diff !== 0) return diff;
        return a.logIndex - b.logIndex;
      });

      const {
        listings,
        orders,
        history,
        stats
      } = processEvents(marketplaceEvents, harvestableIndex);
      dispatch(
        setMarketplaceState({
          listings,
          orders,
          history,
          stats
        })
      );
    };

    if (harvestableIndex != null) {
      fetchMarketplaceListings();
    }

    // eslint-disable-next-line
  }, [harvestableIndex]);

  return null;
}

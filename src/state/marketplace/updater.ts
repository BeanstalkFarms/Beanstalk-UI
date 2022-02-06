import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMarketplaceState,
} from 'state/marketplace/actions';
import orderBy from 'lodash/orderBy';
import {
  beanstalkContractReadOnly,
  toTokenUnitsBN,
} from 'util/index';
import { BEAN } from 'constants/index';
import { PodOrder, PodListing, MarketHistoryItem } from './reducer';
import { EventData } from 'web3-eth-contract';

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

// FIXME: define type for Events
function processEvents(events: EventData[], harvestableIndex: BigNumber) {
  const podListings : { [key: string]: PodListing } = {};
  const podOrders : { [key: string]: PodOrder } = {};
  const marketHistory : MarketHistoryItem[] = [];

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
      const amountBN = toTokenUnitsBN(values.amount, BEAN.decimals);

      // Move current listing's index up by |amount|
      // FIXME: does this match the new marketplace behavior? Believe
      // this assumes we are selling from the front (such that, as a listing
      // is sold, the index increases).
      const prevKey = values.index.toString();
      const currentListing = podListings[prevKey];
      delete podListings[prevKey];
      const newIndex = new BigNumber(values.index).plus(values.amount).plus(values.start);
      const newKey = newIndex.toString();
      podListings[newKey] = currentListing;

      // Bump up |amountSold| for this listing
      podListings[newKey].index = toTokenUnitsBN(newIndex, BEAN.decimals);
      podListings[newKey].start = new BigNumber(0);
      podListings[newKey].filledAmount = podListings[newKey].filledAmount.plus(amountBN);
      podListings[newKey].remainingAmount = currentListing.totalAmount.minus(podListings[newKey].filledAmount);

      // Add to market history
      marketHistory.push({
        // Event info
        type: "PodListingFill",
        timestamp: 0,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex,
        transactionHash: event.transactionHash,
        // Amounts
        amount: amountBN,
        pricePerPod: podListings[newKey].pricePerPod,
        filledBeans: podListings[newKey].pricePerPod.times(amountBN),
        // Parties
        from: values.from,
        to: values.to,
      })

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
      const amountBN = toTokenUnitsBN(values.amount, BEAN.decimals);

      // Check whether current offer is sold or not
      const key = values.id;
      const podOrder = podOrders[key];
      podOrders[key].filledAmount = podOrders[key].filledAmount.plus(amountBN);
      podOrders[key].remainingAmount = podOrder.totalAmount.minus(podOrder.filledAmount);

      // Add to market history
      marketHistory.push({
        // Event info
        type: "PodOrderFill",
        timestamp: 0,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex,
        transactionHash: event.transactionHash,
        // Amounts
        amount: amountBN,
        pricePerPod: podListings[key].pricePerPod,
        filledBeans: podListings[key].pricePerPod.times(amountBN),
        // Partie
        from: values.from,
        to: values.to,
      });

      const isFilled = podOrder.remainingAmount.isEqualTo(0);
      if (isFilled) {
        delete podOrders[key];
      }
    }
  }

  // Finally, order listings and offers by their index and also mark any that have expired.
  const finalPodListings = orderBy(Object.values(podListings), 'index', 'asc').map((listing) => {
    if (listing.maxHarvestableIndex.isLessThanOrEqualTo(harvestableIndex)) {
      return {
        ...listing,
        status: 'expired',
      };
    }
    return listing;
  });
  const finalPodOrders = Object.values(podOrders);

  return {
    listings: finalPodListings,
    orders: finalPodOrders,
    history: marketHistory,
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
        history
      } = processEvents(marketplaceEvents, harvestableIndex);
      dispatch(
        setMarketplaceState({
          listings,
          orders,
          history,
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

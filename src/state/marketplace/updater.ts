import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { AppState } from 'state';
import { useDispatch, useSelector } from 'react-redux';
import {
  setMarketplaceListings,
} from 'state/marketplace/actions';
import orderBy from 'lodash/orderBy';
import {
  beanstalkContractReadOnly,
  toTokenUnitsBN,
} from 'util/index';
import { BEAN } from 'constants/index';
import { PodOrder, PodListing } from './reducer';

// mock global events for marketplace
// TODO: hook this up to real contract events
// eslint-disable-next-line
const MOCK_EVENTS = [
  {
    event: 'PodListingCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(0),
      pricePerPod: new BigNumber(0.98),
      maxHarvestableIndex: new BigNumber(123123123),
      amount: new BigNumber(123123),
    },
  },
  {
    event: 'PodListingCreated',
    returnValues: {
      account: '0xbbb',
      index: new BigNumber(1000000),
      pricePerPod: new BigNumber(0.99),
      maxHarvestableIndex: new BigNumber(123123123),
      amount: new BigNumber(1000),
    },
  },
  {
    event: 'PodListingCancelled',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(0),
    },
  },
  {
    event: 'PodOrderCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(100000),
      amount: new BigNumber(10000),
      pricePerPod: new BigNumber(0.95),
      maxPlaceInLine: new BigNumber(123123),
    },
  },
  {
    event: 'PodOrderCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(300000),
      amount: new BigNumber(10000),
      pricePerPod: new BigNumber(0.95),
      maxPlaceInLine: new BigNumber(123123),
    },
  },
  {
    event: 'PodOrderCancelled',
    returnValues: {
      index: new BigNumber(300000),
    },
  },
  {
    event: 'PodListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: new BigNumber(1000000),
      pricePerPod: new BigNumber(0.99),
      amount: new BigNumber(500),
    },
  },
  {
    event: 'PodListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: new BigNumber(1000500),
      pricePerPod: new BigNumber(0.99),
      amount: new BigNumber(500),
    },
  },
];

// TODO: figure out how to access the Ethers Event type, or
// write our own. Perhaps something like this:
//
// type EthersEvent<A, B> = {
//   event: A;
//   returnValue: B;
// }
// type MarketplaceListingEvent = EthersEvent<
//   'ListingCreated' | 'ListingCancelled' | 'ListingFilled',
//   any
// >;

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

type PodOrderCreatedEvent = {
  account: string;
  orderId: string;
  amount: string;
  pricePerPod: string;
  maxPlaceInLine: string;
}

// FIXME: define type for Events
function processEvents(events: any, harvestableIndex: BigNumber) {
  const listings : { [key: string]: PodListing } = {};
  const buyOffers : { [key: string]: PodOrder } = {};
  console.log('marketplace/updater: processEvents', events);
  for (const event of events) {
    if (event.event === 'PodListingCreated') {
      let values = (event.returnValues as PodListingCreatedEvent);
      listings[values.index] = {
        account: values.account,
        index: toTokenUnitsBN(new BigNumber(values.index), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(values.pricePerPod), BEAN.decimals),
        maxHarvestableIndex: toTokenUnitsBN(new BigNumber(values.maxHarvestableIndex), BEAN.decimals),
        initialAmount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        amount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        amountSold: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'PodListingCancelled') {
      delete listings[event.returnValues.index];
    } else if (event.event === 'PodListingFilled') {
      const values = (event.returnValues as PodListingFilledEvent);
      const amountBN = toTokenUnitsBN(values.amount, BEAN.decimals);

      // Move current listing's index up by |amount|
      // FIXME: does this match the new marketplace behavior? Believe
      // this assumes we are selling from the front (such that, as a listing
      // is sold, the index increases).
      const prevKey = values.index.toString();
      const currentListing = listings[prevKey];
      delete listings[prevKey];
      const newIndex = new BigNumber(values.index).plus(values.amount);
      const newKey = newIndex.toString();
      listings[newKey] = currentListing;

      // Bump up |amountSold| for this listing
      listings[newKey].index = toTokenUnitsBN(newIndex, BEAN.decimals);
      listings[newKey].amountSold = listings[newKey].amountSold.plus(amountBN);
      listings[newKey].amount = currentListing.initialAmount.minus(listings[newKey].amountSold);

      // Check whether current listing is sold or not
      const isSold = listings[newKey].amount.isEqualTo(0);
      if (isSold) {
        listings[newKey].status = 'sold';
        delete listings[newKey];
      }
    } else if (event.event === 'PodOrderCreated') {
      const values = (event.returnValues as PodOrderCreatedEvent);
      buyOffers[values.orderId] = {
        listerAddress: values.account,
        orderId: toTokenUnitsBN(new BigNumber(values.orderId), BEAN.decimals), // FIXME do we need to do this conversion?
        maxPlaceInLine: toTokenUnitsBN(new BigNumber(values.maxPlaceInLine), BEAN.decimals),
        initialAmountToBuy: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(values.pricePerPod), BEAN.decimals),
        amount: toTokenUnitsBN(new BigNumber(values.amount), BEAN.decimals),
        amountBought: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'PodOrderCancelled') {
      delete buyOffers[event.returnValues.index];
    } else if (event.event === 'PodOrderFilled') {
      const { buyOfferIndex, amount } = event.returnValues;
      const amountBN = toTokenUnitsBN(amount, BEAN.decimals);
      const key = buyOfferIndex;

      // Check whether current offer is sold or not
      const buyOffer = buyOffers[key];
      buyOffers[key].amountBought = buyOffers[key].amountBought.plus(amountBN);
      buyOffers[key].amount = buyOffer.initialAmountToBuy.minus(buyOffer.amountBought);

      const isFilled = buyOffer.amount.isEqualTo(0);
      if (isFilled) {
        delete buyOffers[key];
      }
    }
  }

  // Finally, order listings and offers by their index and also mark any that have expired.
  const finalListings = orderBy(Object.values(listings), 'objectiveIndex', 'asc').map((listing) => {
    if (listing.maxHarvestableIndex.isLessThanOrEqualTo(harvestableIndex)) {
      return {
        ...listing,
        status: 'expired',
      };
    }
    return listing;
  });
  const finalBuyOffers = Object.values(buyOffers);

  return {
    listings: finalListings,
    buyOffers: finalBuyOffers,
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
      const events = await Promise.all(
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
      let marketplaceEvents = [].concat.apply([], events);
      marketplaceEvents.sort((a, b) => {
        const diff = a.blockNumber - b.blockNumber;
        if (diff !== 0) return diff;
        return a.logIndex - b.logIndex;
      });

      const {
        listings,
        buyOffers,
      } = processEvents(marketplaceEvents, harvestableIndex);
      dispatch(setMarketplaceListings({
        listings,
        buyOffers,
      }));
    };

    if (harvestableIndex != null) {
      fetchMarketplaceListings();
    }

    // eslint-disable-next-line
  }, [harvestableIndex]);

  return null;
}

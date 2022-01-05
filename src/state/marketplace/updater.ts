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
} from 'util/index';

// mock global events for marketplace
// TODO: hook this up to real contract events
// eslint-disable-next-line
const MOCK_EVENTS = [
  {
    event: 'ListingCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(0),
      pricePerPod: new BigNumber(0.98),
      expiry: new BigNumber(123123123),
      amount: new BigNumber(123123),
    },
  },
  {
    event: 'ListingCreated',
    returnValues: {
      account: '0xbbb',
      index: new BigNumber(1000000),
      pricePerPod: new BigNumber(0.99),
      expiry: new BigNumber(123123123),
      amount: new BigNumber(1000),
    },
  },
  {
    event: 'ListingCancelled',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(0),
    },
  },
  {
    event: 'BuyOfferCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(100000),
      amount: new BigNumber(10000),
      pricePerPod: new BigNumber(0.95),
      maxPlaceInLine: new BigNumber(123123),
    },
  },
  {
    event: 'BuyOfferCreated',
    returnValues: {
      account: '0xaaa',
      index: new BigNumber(300000),
      amount: new BigNumber(10000),
      pricePerPod: new BigNumber(0.95),
      maxPlaceInLine: new BigNumber(123123),
    },
  },
  {
    event: 'BuyOfferCancelled',
    returnValues: {
      index: new BigNumber(300000),
    },
  },
  {
    event: 'ListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: new BigNumber(1000000),
      pricePerPod: new BigNumber(0.99),
      amount: new BigNumber(500),
    },
  },
  {
    event: 'ListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: new BigNumber(1000500),
      pricePerPod: new BigNumber(0.99),
      amount: new BigNumber(500),
    },
  },
];

function processEvents(events, harvestableIndex) {
  const listings = {};
  const buyOffers = {};
  for (const event of events) {
    if (event.event === 'ListingCreated') {
      listings[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        objectiveIndex: new BigNumber(event.returnValues.index),
        pricePerPod: new BigNumber(event.returnValues.pricePerPod),
        expiry: new BigNumber(event.returnValues.expiry),
        initialAmount: new BigNumber(event.returnValues.amount),
        amountSold: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'ListingCancelled') {
      delete listings[event.returnValues.index];
    } else if (event.event === 'ListingFilled') {
      const { index, amount } = event.returnValues;
      // Move current listing's index up by |amount|
      const prevKey = index.toString();
      const currentListing = listings[prevKey];
      delete listings[prevKey];
      const newKey = new BigNumber(index).plus(amount).toString();
      listings[newKey] = currentListing;

      // Check whether current listing is sold or not
      const isSold = currentListing.initialAmount.minus(currentListing.amountSold).minus(amount).isEqualTo(0);
      if (isSold) {
        listings[newKey].status = 'sold';
      }

      // Bump up |amountSold| for this listing
      listings[newKey].amountSold = listings[newKey].amountSold.plus(amount);
    } else if (event.event === 'BuyOfferCreated') {
      buyOffers[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        maxPlaceInLine: new BigNumber(event.returnValues.index),
        initialAmountToBuy: new BigNumber(event.returnValues.amount),
        pricePerPod: new BigNumber(event.returnValues.pricePerPod),
        amountBought: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'BuyOfferCancelled') {
      delete buyOffers[event.returnValues.index];
    } else if (event.event === 'BuyOfferAccepted') {
      const { index, amount } = event.returnValues;
      const key = index;

      // Check whether current offer is sold or not
      const buyOffer = buyOffers[key];
      const isFilled = buyOffer.initialAmountToBuy.minus(buyOffer.amountBought).minus(amount).isEqualTo(0);
      if (isFilled) {
        buyOffers[index].status = 'filled';
      }

      // Bump up |amountBought| for this offer
      buyOffers[key].amountBought = buyOffers[key].amountBought.plus(amount);
    }
  }

  // Finally, order listings and offers by their index and also mark any that have expired.
  const finalListings = orderBy(Object.values(listings), 'objectiveIndex', 'asc').map((listing) => {
    if (listing.expiry.isLessThanOrEqualTo(harvestableIndex)) {
      return {
        ...listing,
        status: 'expired',
      };
    }
    return listing;
  });
  const finalBuyOffers = orderBy(Object.values(buyOffers), 'maxPlaceInLine', 'asc').map((buyOffer) => {
    if (buyOffer.maxPlaceInLine.isLessThanOrEqualTo(harvestableIndex)) {
      return {
        ...buyOffer,
        status: 'expired',
      };
    }
    return buyOffer;
  });

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
      const events = await Promise.all(
        [
          beanstalk.getPastEvents('ListingCreated', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('ListingCancelled', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('BuyOfferCreated', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('BuyOfferCancelled', {
            fromBlock: 0,
          }),
          beanstalk.getPastEvents('ListingFilled', {
            fromBlock: 0,
          }),
        ]
      );
      // eslint-disable-next-line
      let marketplaceEvents = [].concat.apply([], events);
      marketplaceEvents.sort((a, b) => {
        const diff = a.blockNumber - b.blockNumber;
        if (diff !== 0) return diff;
        return a.logIndex - b.logIndex;
      });

      console.log('events:', marketplaceEvents);

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

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setMarketplaceListings,
} from 'state/marketplace/actions';
import orderBy from 'lodash/orderBy';

// mock global events for marketplace
// TODO: hook this up to real contract events
const MOCK_EVENTS = [
  {
    event: 'ListingCreated',
    returnValues: {
      account: '0xaaa',
      index: 0,
      pricePerPod: 0.98,
      expiry: 123123123,
      amount: 123123,
    },
  },
  {
    event: 'ListingCreated',
    returnValues: {
      account: '0xbbb',
      index: 1000000,
      pricePerPod: 0.99,
      expiry: 123123123,
      amount: 1000,
    },
  },
  {
    event: 'ListingCancelled',
    returnValues: {
      account: '0xaaa',
      index: 0,
    },
  },
  {
    event: 'BuyOfferCreated',
    returnValues: {
      account: '0xaaa',
      index: 100000,
      amount: 10000,
      pricePerPod: 0.95,
      maxPlaceInLine: 123123,
    },
  },
  {
    event: 'BuyOfferCreated',
    returnValues: {
      account: '0xaaa',
      index: 300000,
      amount: 10000,
      pricePerPod: 0.95,
      maxPlaceInLine: 123123,
    },
  },
  {
    event: 'BuyOfferCancelled',
    returnValues: {
      index: 300000,
    },
  },
  {
    event: 'ListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: 1000000,
      pricePerPod: 0.99,
      amount: 500,
    },
  },
  {
    event: 'ListingFilled',
    returnValues: {
      buyer: '0xccc',
      seller: '0xaaa',
      index: 1000500,
      pricePerPod: 0.99,
      amount: 500,
    },
  },

];

function processEvents(events) {
  const listings = {};
  const buyOffers = {};
  for (const event of events) {
    if (event.event === 'ListingCreated') {
      listings[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        objectiveIndex: event.returnValues.index,
        pricePerPod: event.returnValues.pricePerPod,
        expiresIn: event.returnValues.expiry,
        initialAmount: event.returnValues.amount,
        amountSold: 0,
        status: 'active',
      };
    } else if (event.event === 'ListingCancelled') {
      delete listings[event.returnValues.index];
    } else if (event.event === 'ListingFilled') {
      const { index, amount } = event.returnValues;
      // Move current listing's index up by |amount|
      const currentListing = listings[index];
      delete listings[index];
      const newIndex = index + amount;
      listings[newIndex] = currentListing;

      // Check whether current listing is sold or not
      const isSold = currentListing.initialAmount - currentListing.amountSold - amount === 0;
      if (isSold) {
        listings[newIndex].status = 'sold';
      }

      // Bump up |amountSold| for this listing
      listings[newIndex].amountSold += amount;
    } else if (event.event === 'BuyOfferCreated') {
      buyOffers[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        maxPlaceInLine: event.returnValues.index,
        initialAmountToBuy: event.returnValues.amount,
        pricePerPod: event.returnValues.pricePerPod,
        amountBought: 0,
        status: 'active',
      };
    } else if (event.event === 'BuyOfferCancelled') {
      delete buyOffers[event.returnValues.index];
    } else if (event.event === 'BuyOfferAccepted') {
      const { index, amount } = event.returnValues;

      // Move current offer's index up by |amount|
      const currentBuyOffer = buyOffer[index];
      delete buyOffers[index];
      const newIndex = index + amount;
      buyOffers[newIndex] = currentBuyOffer;

      // Check whether current offer is sold or not
      const isSold = currentBuyOffer.initialAmountToBuy - currentListing.amountBought - amount === 0;
      if (isSold) {
        buyOffers[newIndex].status = 'sold';
      }

      // Bump up |amountBought| for this offer
      listings[newIndex].amountBought += amount;
    }
  }

  const finalListings = orderBy(Object.values(listings), 'objectiveIndex', 'asc');
  const finalBuyOffers = orderBy(Object.values(buyOffers), 'maxPlaceInLine', 'asc');

  // TODO: set expired listings here
  return {
    listings: finalListings,
    buyOffers: finalBuyOffers,
  };
}

export default function Updater() {
  const dispatch = useDispatch();
  useEffect(() => {
    const {
      listings,
      buyOffers,
    } = processEvents(MOCK_EVENTS);
    dispatch(setMarketplaceListings({
      listings,
      buyOffers,
    }));

    // eslint-disable-next-line
  }, []);

  return null;
}

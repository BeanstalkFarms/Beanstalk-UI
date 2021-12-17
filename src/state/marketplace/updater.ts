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
      amount: 123123,
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
        status: 'hi',
      };
    } else if (event.event === 'ListingCancelled') {
      delete listings[event.returnValues.index];
    } else if (event.event === 'BuyOfferCreated') {
      buyOffers[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        maxPlaceInLine: event.returnValues.account,
        initialAmountToBuy: event.returnValues.account,
        pricePerPod: event.returnValues.account,
        amountBought: event.returnValues.account,
        status: 'hi',
      };
    } else if (event.event === 'BuyOfferCancelled') {
      delete buyOffers[event.returnValues.index];
    }
  }

  const finalListings = orderBy(Object.values(listings), 'objectiveIndex', 'asc');
  const finalBuyOffers = orderBy(Object.values(buyOffers), 'maxPlaceInLine', 'asc');
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

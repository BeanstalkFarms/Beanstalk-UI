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

// FIXME: define type for Events
function processEvents(events, harvestableIndex) {
  const listings = {};
  const buyOffers = {};
  for (const event of events) {
    if (event.event === 'ListingCreated') {
      listings[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        objectiveIndex: toTokenUnitsBN(new BigNumber(event.returnValues.index), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(event.returnValues.pricePerPod), BEAN.decimals),
        expiry: toTokenUnitsBN(new BigNumber(event.returnValues.expiry), BEAN.decimals),
        initialAmount: toTokenUnitsBN(new BigNumber(event.returnValues.amount), BEAN.decimals),
        amount: toTokenUnitsBN(new BigNumber(event.returnValues.amount), BEAN.decimals),
        amountSold: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'ListingCancelled') {
      delete listings[event.returnValues.index];
    } else if (event.event === 'ListingFilled') {
      const { index, amount } = event.returnValues;
      const amountBN = toTokenUnitsBN(amount, BEAN.decimals);
      // Move current listing's index up by |amount|
      const prevKey = index.toString();
      const currentListing = listings[prevKey];
      delete listings[prevKey];
      const newKey = new BigNumber(index).plus(amount).toString();
      listings[newKey] = currentListing;

      // Check whether current listing is sold or not
      const isSold = currentListing.initialAmount.minus(currentListing.amountSold).minus(amountBN).isEqualTo(0);
      if (isSold) {
        listings[newKey].status = 'sold';
      }

      // Bump up |amountSold| for this listing
      listings[newKey].objectiveIndex = toTokenUnitsBN(new BigNumber(index).plus(amount), BEAN.decimals);
      listings[newKey].amountSold = listings[newKey].amountSold.plus(amountBN);
      listings[newKey].amount = currentListing.initialAmount.minus(currentListing.amountSold).minus(amountBN);
    } else if (event.event === 'BuyOfferCreated') {
      buyOffers[event.returnValues.index] = {
        listerAddress: event.returnValues.account,
        index: new BigNumber(event.returnValues.index),
        maxPlaceInLine: toTokenUnitsBN(new BigNumber(event.returnValues.maxPlaceInLine), BEAN.decimals),
        initialAmountToBuy: toTokenUnitsBN(new BigNumber(event.returnValues.amount), BEAN.decimals),
        amount: toTokenUnitsBN(new BigNumber(event.returnValues.amount), BEAN.decimals),
        pricePerPod: toTokenUnitsBN(new BigNumber(event.returnValues.pricePerPod), BEAN.decimals),
        amountBought: new BigNumber(0),
        status: 'active',
      };
    } else if (event.event === 'BuyOfferCancelled') {
      delete buyOffers[event.returnValues.index];
    } else if (event.event === 'BuyOfferFilled') {
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
    if (listing.expiry.isLessThanOrEqualTo(harvestableIndex)) {
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
          beanstalk.getPastEvents('BuyOfferFilled', {
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

import { createAction } from '@reduxjs/toolkit';
import { Listing, BuyOffer } from 'state/marketplace/updater';

export const setMarketplaceListings = createAction<Listing[]>(
  'marketplace/setMarketplaceListings'
);

export const setMarketplaceBuyOffers = createAction<BuyOffer[]>(
  'marketplace/setMarketplaceBuyOffers'
);

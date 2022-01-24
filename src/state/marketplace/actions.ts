import { createAction } from '@reduxjs/toolkit';
import { Listing, BuyOffer } from 'state/marketplace/updater';

export const setMarketplaceListings = createAction<{ listings: Listing[], buyOffers: BuyOffer[] }>(
  'marketplace/setMarketplaceListings'
);

import { createAction } from '@reduxjs/toolkit';
import { Listing } from 'state/marketplace/updater';

export const setMarketplaceListings = createAction<Listing[]>(
  'marketplace/setMarketplaceListings'
);

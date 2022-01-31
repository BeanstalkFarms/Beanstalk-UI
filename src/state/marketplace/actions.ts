import { createAction } from '@reduxjs/toolkit';
import { MarketplaceState } from './reducer';

// FIXME: rename
export const setMarketplaceListings = createAction<MarketplaceState>(
  'marketplace/setMarketplaceListings'
);

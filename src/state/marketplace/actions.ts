import { createAction } from '@reduxjs/toolkit';
import { MarketplaceState } from './reducer';

// FIXME: rename
export const setMarketplaceState = createAction<MarketplaceState>(
  'marketplace/setMarketplaceState'
);

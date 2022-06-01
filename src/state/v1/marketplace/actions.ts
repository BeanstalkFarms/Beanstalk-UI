import { createAction } from '@reduxjs/toolkit';
import { MarketState } from './reducer';

// FIXME: rename
export const setMarketplaceState = createAction<MarketState>(
  'marketplace/setMarketplaceState'
);

import { createAction } from '@reduxjs/toolkit';
import { Listing } from 'state/userBalance/updater';

export const setInitialized = createAction<Boolean>(
  'general/setInitialized'
);

export const setMetamaskFailure = createAction<Number>(
  'general/setMetamaskFailure'
);

export const setLastCross = createAction<Number>(
  'general/setLastCross'
);

export const setBips = createAction<Array>(
  'general/setBips'
);

export const setContractEvents = createAction<Array>(
  'general/setContractEvents'
);

export const setMarketplaceListings = createAction<Listing[]>(
  'general/setMarketplaceListings'
);

export const setHasActiveBIP = createAction<Boolean>(
  'general/setHasActiveBIP'
);

export const setFundraisers = createAction<Array>(
  'general/setFundraisers'
);

export const setHasActiveFundraiser = createAction<Boolean>(
  'general/setHasActiveFundraiser'
);

export const setWidth = createAction<Number>(
  'general/setWidth'
);

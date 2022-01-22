import { createAction } from '@reduxjs/toolkit';

export const setInitialized = createAction<boolean>(
  'general/setInitialized'
);

export const setMetamaskFailure = createAction<number>(
  'general/setMetamaskFailure'
);

export const setLastCross = createAction<number>(
  'general/setLastCross'
);

export const setBips = createAction<Array>(
  'general/setBips'
);

export const setContractEvents = createAction<Array>(
  'general/setContractEvents'
);

export const setHasActiveBIP = createAction<boolean>(
  'general/setHasActiveBIP'
);

export const setFundraisers = createAction<Array>(
  'general/setFundraisers'
);

export const setHasActiveFundraiser = createAction<boolean>(
  'general/setHasActiveFundraiser'
);

export const setWidth = createAction<number>(
  'general/setWidth'
);

export const setDrawerOpen = createAction<boolean>(
  'general/setDrawerOpen'
);

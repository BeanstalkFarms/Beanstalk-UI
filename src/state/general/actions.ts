import { createAction } from '@reduxjs/toolkit';

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

export const setHasActiveBIP = createAction<Boolean>(
  'general/setHasActiveBIP'
);

export const setFundraisers = createAction<Array>(
  'general/setFundraisers'
);

export const setHasActiveFundraiser = createAction<Boolean>(
  'general/setHasActiveFundraiser'
);

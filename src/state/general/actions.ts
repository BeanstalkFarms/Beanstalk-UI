import { createAction } from '@reduxjs/toolkit';

export enum TransactionState {
  PENDING,
  DONE,
}

export interface Transaction {
  /** */
  transactionNumber: number;
  /** */
  description: string;
  /** */
  transactionHash: string;
  /** */
  state: TransactionState;
}

export const setInitialized = createAction<Boolean>('general/setInitialized');

export const setMetamaskFailure = createAction<Number>(
  'general/setMetamaskFailure'
);

export const setLastCross = createAction<Number>('general/setLastCross');

export const setBips = createAction<Array>('general/setBips');

export const setContractEvents = createAction<Array>(
  'general/setContractEvents'
);

export const setHasActiveBIP = createAction<Boolean>('general/setHasActiveBIP');

export const setFundraisers = createAction<Array>('general/setFundraisers');

export const setHasActiveFundraiser = createAction<Boolean>(
  'general/setHasActiveFundraiser'
);

export const setWidth = createAction<Number>('general/setWidth');

export const addTransaction = createAction<Transaction>(
  'general/addTransaction'
);

export const completeTransaction = createAction<Number>(
  'general/completeTransaction'
);

export const updateTransactionHash = createAction<any>(
  'general/updateTransactionHash'
);

export const setDrawerOpen = createAction<boolean>(
  'general/setDrawerOpen'
);

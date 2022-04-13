import { createAction } from '@reduxjs/toolkit';
import { EventData } from 'web3-eth-contract';

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
  state: TransactionState;
  /** */
  transactionHash?: string;
}

export const setInitialized = createAction<boolean>(
  'general/setInitialized'
);

export const setMetamaskFailure = createAction<number>(
  'general/setMetamaskFailure'
);

export const setLastCross = createAction<number>(
  'general/setLastCross'
);

export const setBips = createAction<Array>('general/setBips');

export const setContractEvents = createAction<EventData[]>(
  'general/setContractEvents'
);

// export const addContractEvents = createAction<EventData[]>(
//   'general/addContractEvents'
// );

export const setHasActiveBIP = createAction<boolean>(
  'general/setHasActiveBIP'
);

export const setFundraisers = createAction<Array>('general/setFundraisers');

export const setHasActiveFundraiser = createAction<boolean>(
  'general/setHasActiveFundraiser'
);

// TEMPORARILY DEPRECATED - 1/23/2022
// To be replaced or upgraded after form overhaul, Q1 2022.
// ---
// export const addTransaction = createAction<Transaction>(
//   'general/addTransaction'
// );
// export const completeTransaction = createAction<Transaction['transactionNumber']>(
//   'general/completeTransaction'
// );
// export const updateTransactionHash = createAction<{
//   transactionNumber: Transaction['transactionNumber'],
//   transactionHash: Transaction['transactionHash'],
// }>(
//   'general/updateTransactionHash'
// );

export const setWidth = createAction<number>(
  'general/setWidth'
);

export const setDrawerOpen = createAction<boolean>(
  'general/setDrawerOpen'
);

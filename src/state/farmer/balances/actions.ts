import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import Token from 'classes/Token';

export type UpdateBalancePayload = {
  token: Token,
  balance: BigNumber
};

export const updateBalances = createAction<UpdateBalancePayload[]>(
  'farmer/balances/updateMultiple'
);

export const updateBalance = createAction<UpdateBalancePayload>(
  'farmer/balances/update'
);

export const clearBalances = createAction(
  'farmer/balances/clear'
);

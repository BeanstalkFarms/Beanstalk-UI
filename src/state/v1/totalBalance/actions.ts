import { createAction } from '@reduxjs/toolkit';
import { TotalBalanceState } from './reducer';

export const setTotalBalance = createAction<Partial<TotalBalanceState>>(
  'totalBalance/setTotalBalance'
);

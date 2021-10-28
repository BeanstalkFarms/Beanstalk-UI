import { createAction } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';

export const setTotalBalance = createAction<BigNumber>(
  'totalBalance/setTotalBalance'
);

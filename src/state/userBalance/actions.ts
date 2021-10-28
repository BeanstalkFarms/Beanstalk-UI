import { createAction } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';

export const setUserBalance = createAction<BigNumber>(
  'userBalance/setUserBalance'
);

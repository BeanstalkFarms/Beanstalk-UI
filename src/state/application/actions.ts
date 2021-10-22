import { createAction } from '@reduxjs/toolkit';

export type TokenPrice = {
  key: string;
  value: number;
};

export const updateTokenPrices = createAction<TokenPrice[]>(
  'application/updateTokenPrice'
);

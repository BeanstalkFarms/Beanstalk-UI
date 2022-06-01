import { createAction } from '@reduxjs/toolkit';

export const setPrices = createAction<Object>(
  'prices/setPrices'
);

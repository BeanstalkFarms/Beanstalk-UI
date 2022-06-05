import { createAction } from '@reduxjs/toolkit';

export const setUserBalance = createAction<Object>(
  'userBalance/setUserBalance'
);

import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

export const setAvailable = createAction<BigNumber>(
  'beanstalk/fertilizer/setAvailable'
);

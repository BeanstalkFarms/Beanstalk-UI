import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

export const updateSeason = createAction<BigNumber>(
  'beanstalk/sun/updateSeason'
);

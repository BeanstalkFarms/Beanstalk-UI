import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

export const updateHarvestableIndex = createAction<BigNumber>(
  'beanstalk/field/updateHarvestableIndex'
);

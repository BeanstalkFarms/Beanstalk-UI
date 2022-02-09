import { createAction } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';

export const updateUniswapBeanAllowance = createAction<BigNumber>(
  'allowances/updateUniswapBeanAllowance'
);

export const updateBeanstalkBeanAllowance = createAction<BigNumber>(
  'allowances/updateBeanstalkBeanAllowance'
);

export const updateBeanstalkLPAllowance = createAction<BigNumber>(
  'allowances/updateBeanstalkLPAllowance'
);

export const updateBeanstalkUSDCAllowance = createAction<BigNumber>(
  'allowances/updateBeanstalkUSDCAllowance'
);

export const updateBeanstalkCurveAllowance = createAction<BigNumber>(
  'allowances/updateBeanstalkCurveAllowance'
);

import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { Barn } from '.';

export const resetBarn = createAction('beanstalk/barn/reset');

export const updateBarn = createAction<Barn>('beanstalk/barn/update');

export const setRemaining = createAction<BigNumber>(
  'beanstalk/barn/setRemaining'
);
export const setTotalRaised = createAction<BigNumber>(
  'beanstalk/barn/setTotalRaised'
);
export const setHumidity = createAction<BigNumber>(
  'beanstalk/barn/setHumidity'
);

import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

export const setRemaining = createAction<BigNumber>(
  'beanstalk/fertilizer/setRemaining'
);
export const setTotalRaised = createAction<BigNumber>(
  'beanstalk/fertilizer/setTotalRaised'
);
export const resetFertilizer = createAction(
  'beanstalk/fertilizer/reset'
);
// export const setHumidity = createAction<BigNumber>(
//   'beanstalk/fertilizer/setHumidity'
// );

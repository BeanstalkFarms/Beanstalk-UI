import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeanstalkSilo } from '.';

export const resetBeanstalkSilo = createAction('beanstalk/silo/reset');

export const updateBeanstalkSilo = createAction<BeanstalkSilo>(
  'beanstalk/silo/update'
);

// export const updateWithdrawSeasons = createAction<BigNumber>(
//   'beanstalk/silo/updateWithdrawSeasons'
// );

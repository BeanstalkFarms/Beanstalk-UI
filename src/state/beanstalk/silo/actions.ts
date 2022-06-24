import { createAction } from '@reduxjs/toolkit';
import { BeanstalkSilo } from '.';

export const resetBeanstalkSilo = createAction(
  'beanstalk/silo/reset'
);

export const updateBeanstalkSiloAssets = createAction<BeanstalkSilo>(
  'beanstalk/silo/update'
);

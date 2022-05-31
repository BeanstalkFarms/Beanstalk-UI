import { createAction } from '@reduxjs/toolkit';
import { BeanstalkSiloAssets } from '.';

export const resetBeanstalkSilo = createAction(
  'beanstalk/silo/reset'
);

export const updateBeanstalkSiloAssets = createAction<BeanstalkSiloAssets>(
  'beanstalk/silo/update'
);

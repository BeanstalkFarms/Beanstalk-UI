import { createAction } from '@reduxjs/toolkit';
import { BeanstalkGovernance } from '.';

export const resetBeanstalkGovernance = createAction(
  'beanstalk/governance/reset'
);

export const updateActiveProposals = createAction<BeanstalkGovernance>(
  'beanstalk/governance/update'
);

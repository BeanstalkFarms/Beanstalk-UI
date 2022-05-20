import { createAction } from '@reduxjs/toolkit';
import { BeanPoolState } from '.';

export type UpdatePoolPayload = {
  address: string;
  pool: Partial<BeanPoolState>;
};

export const updateBeanPool = createAction<UpdatePoolPayload>(
  'bean/pool/update'
);
export const updateBeanPools = createAction<UpdatePoolPayload[]>(
  'bean/pool/updateAll'
);

import { createAction } from '@reduxjs/toolkit';
import { BeanPoolState } from '.';

type UpdatePoolPayload = {
  address: string;
  pool: BeanPoolState;
};

export const updateBeanPool = createAction<UpdatePoolPayload>(
  'bean/pool/update'
);
export const updateBeanPools = createAction<UpdatePoolPayload[]>(
  'bean/pool/updateAll'
);

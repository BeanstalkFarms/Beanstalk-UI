import { createAction } from '@reduxjs/toolkit';
import { SupportedToken } from 'constants/tokens';
import BigNumber from 'bignumber.js';

export type UpdateAllowancePayload = {
  token: SupportedToken,
  allowance: BigNumber
};

export const updateAllowances = createAction<UpdateAllowancePayload[]>(
  'allowances/updateAllowances'
);

export const updateAllowance = createAction<UpdateAllowancePayload>(
  'allowances/updateAllowance'
);

export const clearAllowances = createAction(
  'allowances/clearAllowances'
);

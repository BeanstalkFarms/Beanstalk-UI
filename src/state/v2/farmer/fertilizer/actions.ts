import { createAction } from '@reduxjs/toolkit';
import { FertByID } from '.';

export const updateFertTokens = createAction<FertByID>(
  'farmer/fertilizer/updateFertTokens'
);
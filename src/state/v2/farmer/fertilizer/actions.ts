import { createAction } from '@reduxjs/toolkit';
import { FertByID } from '.';

export const updateFertilizer = createAction<FertByID>(
  'farmer/fertilizer/updateFertilizer'
);

export const resetFertilizer = createAction(
  'farmer/fertilizer/reset'
);

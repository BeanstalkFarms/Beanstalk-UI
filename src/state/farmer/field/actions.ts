import { createAction } from '@reduxjs/toolkit';
import { Field } from '.';

export const resetFarmerField = createAction(
  'farmer/field/reset'
)
export const updateFarmerField = createAction<Field>(
  'farmer/field/updateFarmerField'
);

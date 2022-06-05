import { createAction } from '@reduxjs/toolkit';
import { Field } from '.';

export const updateFarmerField = createAction<Field>(
  'farmer/silo/updateFarmerField'
);

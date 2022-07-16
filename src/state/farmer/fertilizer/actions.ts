import { createAction } from '@reduxjs/toolkit';
import { FarmerFertilizer } from '.';

export const updateFarmerFertilizer = createAction<FarmerFertilizer>(
  'farmer/fertilizer/updateFertilizer'
);

// export const updateFertilizer = createAction<FertByID>(
//   'farmer/fertilizer/updateFertilizer'
// );


export const resetFertilizer = createAction(
  'farmer/fertilizer/reset'
);

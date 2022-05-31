import { createAction } from '@reduxjs/toolkit';
import { FarmerSiloAssets, FarmerTokenBalance } from '.';

export type UpdateFarmerTokenBalancesPayload = { 
  [address: string]: Partial<FarmerTokenBalance>;
};

export const resetFarmerSilo = createAction(
  'farmer/silo/reset'
);

export const updateFarmerSiloAssets = createAction<FarmerSiloAssets>(
  'farmer/silo/update'
);

export const updateFarmerTokenBalances = createAction<UpdateFarmerTokenBalancesPayload>(
  'farmer/silo/updateFarmerTokenBalances'
);

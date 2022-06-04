import { createAction } from '@reduxjs/toolkit';
import { FarmerSiloRewards, FarmerSiloBalance } from '.';

export type UpdateFarmerTokenBalancesPayload = { 
  [address: string]: Partial<FarmerSiloBalance>;
};

export const resetFarmerSilo = createAction(
  'farmer/silo/reset'
);

export const updateFarmerSiloAssets = createAction<FarmerSiloRewards>(
  'farmer/silo/update'
);

export const updateFarmerTokenBalances = createAction<UpdateFarmerTokenBalancesPayload>(
  'farmer/silo/updateFarmerTokenBalances'
);

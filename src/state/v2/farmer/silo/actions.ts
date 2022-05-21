import { createAction } from '@reduxjs/toolkit';
import { FarmerSiloAssets, FarmerSiloAsset, FarmerTokenBalance } from '.';

export type UpdateFarmerTokenBalancesPayload = { 
  [address: string]: Partial<FarmerTokenBalance>;
};

export const reset = createAction(
  'farmer/silo/reset'
);

export const updateFarmerTokenBalances = createAction<UpdateFarmerTokenBalancesPayload>(
  'farmer/silo/updateFarmerTokenBalances'
);

export type UpdateSiloAssetsPayload = {
  [asset in keyof FarmerSiloAssets]: FarmerSiloAsset;
};

export const updateFarmerSiloAssets = createAction<UpdateSiloAssetsPayload>(
  'farmer/silo/updateFarmerSiloAssets'
);

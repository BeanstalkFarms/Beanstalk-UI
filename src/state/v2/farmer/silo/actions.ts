import { createAction } from '@reduxjs/toolkit';
import { UserSiloAssets, UserSiloAsset, UserTokenBalance } from '.';

export type UpdateUserTokenBalancesPayload = { 
  [address: string]: Partial<UserTokenBalance>;
};

export const updateUserTokenBalances = createAction<UpdateUserTokenBalancesPayload>(
  'farmer/silo/updateUserTokenBalances'
);

export type UpdateSiloAssetsPayload = {
  [asset in keyof UserSiloAssets]: UserSiloAsset;
};

export const updateSiloAssets = createAction<UpdateSiloAssetsPayload>(
  'farmer/silo/updateSiloAssets'
);

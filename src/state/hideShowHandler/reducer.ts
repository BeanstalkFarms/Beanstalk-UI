import { createReducer } from '@reduxjs/toolkit';
import { setHideShowState } from './actions';

const isHiddenInLocalStorage = JSON.parse(
  localStorage.getItem('isHidden') || 'false'
);
console.log('isHiddenInLocalStorage', isHiddenInLocalStorage);
export interface hideShowState {
  about: Boolean;
  analytics: Boolean;
  balances: Boolean;
  charts: Boolean;
  field: Boolean;
  governance: Boolean;
  nft: Boolean;
  silo: Boolean;
  trade: Boolean;
}

export const initialState: hideShowState = {
  about: isHiddenInLocalStorage.about,
  analytics: isHiddenInLocalStorage.analytics,
  balances: isHiddenInLocalStorage.balances,
  charts: isHiddenInLocalStorage.charts,
  field: isHiddenInLocalStorage.field,
  governance: isHiddenInLocalStorage.governance,
  nft: isHiddenInLocalStorage.nft,
  silo: isHiddenInLocalStorage.silo,
  trade: isHiddenInLocalStorage.trade,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setHideShowState, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);

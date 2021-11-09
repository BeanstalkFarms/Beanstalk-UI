import { createReducer } from '@reduxjs/toolkit';
import { setHideShowState } from './actions';

const isHiddenInLocalStorage = JSON.parse(
  localStorage.getItem('isHidden') || 'false'
);
console.log('isHiddenInLocalStorage', isHiddenInLocalStorage);
export interface hideShowState {
  silo: Boolean;
  field: Boolean;
  trade: Boolean;
  nft: Boolean;
  governance: Boolean;
}

export const initialState: hideShowState = {
  governance: isHiddenInLocalStorage.governance,
  trade: isHiddenInLocalStorage.trade,
  nft: isHiddenInLocalStorage.nft,
  silo: isHiddenInLocalStorage.silo,
  field: isHiddenInLocalStorage.field,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setHideShowState, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);

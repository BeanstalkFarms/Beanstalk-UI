import { createReducer } from '@reduxjs/toolkit';
import { setHideShowState } from './actions';

const isHiddenInLocalStorage = JSON.parse(
  localStorage.getItem('isHidden') || 'true'
);
export interface hideShowState {
  about: Boolean;
  analytics: Boolean;
  balances: Boolean;
  charts: Boolean;
  field: Boolean;
  governance: Boolean;
  nft: Boolean;
  silo: Boolean;
  seasons: Boolean;
  trade: Boolean;
  descriptions: {
    silo: Boolean;
    field: Boolean;
    trade: Boolean;
    nft: Boolean;
    governance: Boolean;
  }
}

export const initialState: hideShowState = {
  about: isHiddenInLocalStorage.about || true,
  analytics: isHiddenInLocalStorage.analytics || true,
  balances: isHiddenInLocalStorage.balances || true,
  charts: isHiddenInLocalStorage.charts || true,
  field: isHiddenInLocalStorage.field || true,
  governance: isHiddenInLocalStorage.governance || true,
  nft: isHiddenInLocalStorage.nft || true,
  silo: isHiddenInLocalStorage.silo || true,
  seasons: isHiddenInLocalStorage.seasons || true,
  trade: isHiddenInLocalStorage.trade || true,
  descriptions: {
    silo: isHiddenInLocalStorage?.descriptions?.silo || true,
    field: isHiddenInLocalStorage?.descriptions?.field || true,
    trade: isHiddenInLocalStorage?.descriptions?.trade || true,
    nft: isHiddenInLocalStorage?.descriptions?.nft || true,
    governance: isHiddenInLocalStorage?.descriptions?.governance || true,
  },
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setHideShowState, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);

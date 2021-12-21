import { createReducer } from '@reduxjs/toolkit';
import {
  setUnclaimedNFTs,
  setClaimedNFTs,
  setAccountNFTs,
  setNumNFTs,
} from './actions';

export interface NftState {
  unclaimedNFTs: Array;
  claimedNFTs: Array;
  accountNFTs: Array;
  numNFTs: Number;
}

export const initialState: NftState = {
  unclaimedNFTs: [],
  claimedNFTs: [],
  accountNFTs: [],
  numNFTs: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setUnclaimedNFTs, (state, { payload }) => {
      state.unclaimedNFTs = payload;
    })
    .addCase(setClaimedNFTs, (state, { payload }) => {
      state.claimedNFTs = payload;
    })
    .addCase(setAccountNFTs, (state, { payload }) => {
      state.accountNFTs = payload;
    })
    .addCase(setNumNFTs, (state, { payload }) => {
      state.numNFTs = payload;
    })
);

import { createReducer } from '@reduxjs/toolkit';
import {
  setUnclaimedWinterNFTs,
  setUnclaimedNFTs,
  setClaimedNFTs,
  setAccountNFTs,
  setClaimedWinterNFTs,
  setInvestmentNFTs,
  setNFTs,
} from './actions';

export interface NftState {
  unclaimedWinterNFTs: Array;
  unclaimedNFTs: Array;
  claimedWinterNFTs: Array;
  claimedNFTs: Array;
  accountNFTs: Array;
  investmentNFTs: Array;
  totalNFTs: Number,
  genesisNFTs: Number;
  winterNFTs: Number;
  mintedNFTs: Array;
  unmintedNFTs: Number;
  earnedNFTs: Number;
  investedBeans: Number;
}

export const initialState: NftState = {
  unclaimedWinterNFTs: [],
  unclaimedNFTs: [],
  claimedWinterNFTs: [],
  claimedNFTs: [],
  accountNFTs: [],
  investmentNFTs: [],
  totalNFTs: 0,
  genesisNFTs: 0,
  winterNFTs: 0,
  mintedNFTs: [],
  unmintedNFTs: 0,
  earnedNFTs: 0,
  investedBeans: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setUnclaimedWinterNFTs, (state, { payload }) => {
      state.unclaimedWinterNFTs = payload;
    })
    .addCase(setUnclaimedNFTs, (state, { payload }) => {
      state.unclaimedNFTs = payload;
    })
    .addCase(setClaimedWinterNFTs, (state, { payload }) => {
      state.claimedWinterNFTs = payload;
    })
    .addCase(setClaimedNFTs, (state, { payload }) => {
      state.claimedNFTs = payload;
    })
    .addCase(setAccountNFTs, (state, { payload }) => {
      state.accountNFTs = payload;
    })
    .addCase(setInvestmentNFTs, (state, { payload }) => {
      state.investmentNFTs = payload;
    })
    .addCase(setNFTs, (state, { payload }) => {
      Object.keys(payload).map((key) => {
        state[key] = payload[key];
        return state[key];
      });
    })
);

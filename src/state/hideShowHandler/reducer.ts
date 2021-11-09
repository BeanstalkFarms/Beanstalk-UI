import { createReducer } from '@reduxjs/toolkit';
import { setHideShowState } from './actions';

export interface hideShowState {
    isGovernanceHidden: Boolean;
}

export const initialState: hideShowState = {
  isGovernanceHidden: false,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setHideShowState, (state, { payload }) => {
    Object.keys(payload).map((key) => {
      state[key] = payload[key];
      return state[key];
    });
  })
);

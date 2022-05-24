import { combineReducers, createAction, createReducer } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import pools from './pools/reducer';

const initialState : [BigNumber] = [new BigNumber(-1)];

export const updateBeanPrice = createAction<BigNumber>('bean/updatePrice');

const price = createReducer(initialState, (builder) => 
  builder
    .addCase(updateBeanPrice, (_, { payload }) => [payload])
);
  
export default combineReducers({
  pools,
  price,
});

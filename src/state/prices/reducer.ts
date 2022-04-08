import { createReducer } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { setPrices } from './actions';

export interface PriceState {
  beanPrice: BigNumber;
  usdcPrice: BigNumber;
  ethReserve: BigNumber;
  beanReserve: BigNumber;
  beanTWAPPrice: BigNumber;
  usdcTWAPPrice: BigNumber;
  beansToPeg: BigNumber;
  lpToPeg: BigNumber;
  curveVirtualPrice: BigNumber;
  beanCrv3Price: BigNumber;
  beanCrv3Reserve: BigNumber;
  crv3Reserve: BigNumber;
  curveToBdv: BigNumber;
  beanlusdToBDV: BigNumber;
  beanlusdVirtualPrice: BigNumber;
  beanlusdPrice: BigNumber;
  beanlusdReserve: BigNumber;
  lusdReserve: BigNumber;
  lusdCrv3Price: BigNumber;
  ethPrices: {
    fast: BigNumber;
    propose: BigNumber;
    safe: BigNumber;
    ethPrice: BigNumber;
  };
  priceTuple: {
    deltaB: BigNumber;
    liquidity: BigNumber;
    price: BigNumber;
  };
  curveTuple: {
    balances: Array;
    deltaB: BigNumber;
    liquidity: BigNumber;
    price: BigNumber;
    pool: Array;
    tokens: String;
  };
  uniTuple: {
    balances: BigNumber;
    deltaB: BigNumber;
    liquidity: BigNumber;
    price: BigNumber;
    pool: Array;
    tokens: String;
  };
  beanlusdTuple: {
    balances: BigNumber;
    deltaB: BigNumber;
    liquidity: BigNumber;
    price: BigNumber;
    pool: Array;
    tokens: String;
  };
}

export const initialState: PriceState = {
  beanPrice: new BigNumber(-1),
  usdcPrice: new BigNumber(-1),
  ethReserve: new BigNumber(-1),
  beanReserve: new BigNumber(-1),
  beanTWAPPrice: new BigNumber(-1),
  usdcTWAPPrice: new BigNumber(-1),
  beansToPeg: new BigNumber(-1),
  lpToPeg: new BigNumber(-1),
  curveVirtualPrice: new BigNumber(-1),
  beanCrv3Price: new BigNumber(-1),
  beanCrv3Reserve: new BigNumber(-1),
  crv3Reserve: new BigNumber(-1),
  curveToBdv: new BigNumber(-1),
  beanlusdToBdv: new BigNumber(-1),
  beanlusdVirtualPrice: new BigNumber(-1),
  beanlusdPrice: new BigNumber(-1),
  beanlusdReserve: new BigNumber(-1),
  lusdReserve: new BigNumber(-1),
  lusdCrv3Price: new BigNumber(-1),
  ethPrices: {
    fast: new BigNumber(-1),
    propose: new BigNumber(-1),
    safe: new BigNumber(-1),
    ethPrice: new BigNumber(-1),
  },
  priceTuple: {
    deltaB: new BigNumber(-1),
    liquidity: new BigNumber(-1),
    price: new BigNumber(-1),
  },
  curveTuple: {
    balances: [],
    deltaB: new BigNumber(-1),
    liquidity: new BigNumber(-1),
    price: new BigNumber(-1),
    pool: '',
    tokens: [],
  },
  uniTuple: {
    balances: [],
    deltaB: new BigNumber(-1),
    liquidity: new BigNumber(-1),
    price: new BigNumber(-1),
    pool: '',
    tokens: [],
  },
  beanlusdTuple: {
    balances: [],
    deltaB: new BigNumber(-1),
    liquidity: new BigNumber(-1),
    price: new BigNumber(-1),
    pool: '',
    tokens: [],
  },
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setPrices, (state, { payload }) => {
      // Shallow update of PriceState
      // Use .map instead of for..in because
      // linting doesn't like the latter for some reason
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    })
);

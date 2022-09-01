import type { EthPriceResponse } from '~/functions/ethprice/ethprice';

export type Settings = {
  denomination: 'usd' | 'bdv';
};

export type Globals = {
  showSettings: boolean;
}

/// Not included in `App` are "flags", which are values saved in localStorage
/// See `useAppFlag`

export type App = {
  /** ETH price data */
  ethPrices: null | EthPriceResponse;
  /** User settings; persisted between page loads */
  settings: Settings;
  /**  */
  globals: Globals;
}

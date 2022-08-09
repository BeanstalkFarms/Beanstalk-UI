import type { EthPriceResponse } from '~/functions/ethprice/ethprice';

export type AppSettings = {
  denomination: 'usd' | 'bdv';
};

export type AppFlags = {
  /** ETH price data */
  ethPrices: null | EthPriceResponse;
  /** User settings */
  settings: AppSettings;
}

export type App = AppFlags;

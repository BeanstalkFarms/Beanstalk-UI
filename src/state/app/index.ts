import type { EthPriceResponse } from '~/functions/ethprice/ethprice';

export type Settings = {
  denomination: 'usd' | 'bdv';
};

export type Flags = {

}

export type App = {
  /** ETH price data */
  ethPrices: null | EthPriceResponse;
  /** User settings */
  settings: Settings;
}

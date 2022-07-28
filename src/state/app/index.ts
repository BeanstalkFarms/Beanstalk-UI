import { EthPriceResponse } from 'functions/ethprice/ethprice';

export type AppSettings = {
  denomination: 'usd' | 'bdv';
};

export type AppFlags = {
  almanacView: boolean;
  ethPrices: null | EthPriceResponse;
  settings: AppSettings;
}

export type App = AppFlags;

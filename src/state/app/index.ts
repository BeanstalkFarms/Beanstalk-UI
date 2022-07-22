import { EthPriceResponse } from 'functions/ethprice/ethprice';

export type AppFlags = {
  almanacView: boolean;
  ethPrices: null | EthPriceResponse;
}

export type App = AppFlags;

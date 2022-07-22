import { createAction } from '@reduxjs/toolkit';
import { EthPriceResponse } from 'functions/ethprice/ethprice';

export const setAlmanacView = createAction<boolean>(
  'app/setAlmanacView'
);

export const setEthPrices = createAction<EthPriceResponse | null>(
  'app/setEthPrices'
);

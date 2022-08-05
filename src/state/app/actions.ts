import { createAction } from '@reduxjs/toolkit';
import { EthPriceResponse } from 'functions/ethprice/ethprice';
import { AppSettings } from '.';

export const setAlmanacView = createAction<boolean>(
  'app/setAlmanacView'
);

export const setEthPrices = createAction<EthPriceResponse | null>(
  'app/setEthPrices'
);

type SettingsPayload<T extends keyof AppSettings> = {
  key: T;
  value: AppSettings[T];
}

export const updateSetting = createAction<SettingsPayload<keyof AppSettings>>(
  'app/updateSetting'
);

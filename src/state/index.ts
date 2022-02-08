import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import allowances from './allowances/reducer';
import season from './season/reducer';
import userBalance from './userBalance/reducer';
import totalBalance from './totalBalance/reducer';
import prices from './prices/reducer';
import weather from './weather/reducer';
import beansPerSeason from './beansPerSeason/reducer';
import general from './general/reducer';
import marketplace from './marketplace/reducer';
import nfts from './nfts/reducer';
import tokenBalances from './tokenBalance/reducer';

const store = configureStore({
  reducer: {
    allowances,
    userBalance,
    totalBalance,
    season,
    weather,
    prices,
    beansPerSeason,
    general,
    marketplace,
    nfts,
    tokenBalances,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: false,
    }),
  ],
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

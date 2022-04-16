import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

// v1
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

// v2
import _bean from './v2/bean/reducer';
import _farmer from './v2/farmer/reducer';

const store = configureStore({
  reducer: {
    // v1
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
    // v2
    _bean,
    _farmer,
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

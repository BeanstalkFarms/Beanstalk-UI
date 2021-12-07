import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import allowances from './allowances/reducer';
import season from './season/reducer';
import userBalance from './userBalance/reducer';
import totalBalance from './totalBalance/reducer';
import prices from './prices/reducer';
import weather from './weather/reducer';
import beansPerSeason from './beansPerSeason/reducer';
import general from './general/reducer';
import application from './application/reducer';

const store = configureStore({
  reducer: {
    application,
    allowances,
    userBalance,
    totalBalance,
    season,
    weather,
    prices,
    beansPerSeason,
    general,
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

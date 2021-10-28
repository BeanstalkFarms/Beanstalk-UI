import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import allowances from './allowances/reducer';
import userBalance from './userBalance/reducer';
import totalBalance from './totalBalance/reducer';

const PERSISTED_KEYS: string[] = [];

const store = configureStore({
  reducer: {
    allowances,
    userBalance,
    totalBalance,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: false,
    }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

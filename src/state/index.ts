import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { saveState } from 'util/State';
import throttle from 'lodash/throttle';

import _bean from './bean/reducer';
import _beanstalk from './beanstalk/reducer';
import _farmer from './farmer/reducer';

// const persistedState = loadState();

const store = configureStore({
  reducer: {
    _bean,
    _beanstalk,
    _farmer,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: false,
    }),
  ],
  preloadedState: {}
});

store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

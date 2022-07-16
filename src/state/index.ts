import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { loadState, saveState } from 'util/State';
import throttle from 'lodash/throttle';

import _bean from './bean/reducer';
import _beanstalk from './beanstalk/reducer';
import _farmer from './farmer/reducer';
import { ethers } from 'ethers';
import { FarmerEvents } from './farmer/events2';

const rehydrateEvents2 = (events2: FarmerEvents | undefined) => {
  try {
    if (!events2) return;
    const cache = { ...events2 };
    Object.keys(cache).forEach((key) => {
      if (cache[key].events?.length > 0) {
        cache[key].events = cache[key].events.map((event) => {
          return {
            ...event,
            args: event.args?.map((arg: any) => {
              if (typeof arg === "object" && arg.type === "BigNumber") {
                return ethers.BigNumber.from(arg.hex);
              }
              return arg;
            }) || [],
          }
        });
      }
    });
    return cache;
  } catch (err) {
    console.error(err);
    return {}; //
  }
}

const persistedState = loadState();

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

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import _bean from './bean/reducer';
import _beanstalk from './beanstalk/reducer';
import _farmer from './farmer/reducer';

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
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

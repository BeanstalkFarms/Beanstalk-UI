import { combineReducers } from '@reduxjs/toolkit';

import balances from './balances/reducer';
import events from './events/reducer';
import fertilizer from './fertilizer/reducer';
import field from './field/reducer';
import silo from './silo/reducer';

export default combineReducers({
  balances,
  events,
  fertilizer,
  field,
  silo,
});

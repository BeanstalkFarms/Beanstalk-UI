import { combineReducers } from '@reduxjs/toolkit';

import allowances from './allowances/reducer';
import balances from './balances/reducer';
import events from './events/reducer';
import fertilizer from './fertilizer/reducer';
import field from './field/reducer';
import silo from './silo/reducer';

export default combineReducers({
  allowances,
  balances,
  events,
  fertilizer,
  field,
  silo,
});

import { combineReducers } from '@reduxjs/toolkit';

import allowances from './allowances/reducer';
import balances from './balances/reducer';
import events from './events/reducer';
import events2 from './events2/reducer';
import fertilizer from './fertilizer/reducer';
import field from './field/reducer';
import silo from './silo/reducer';

export default combineReducers({
  allowances,
  balances,
  events,
  events2,
  fertilizer,
  field,
  silo,
});

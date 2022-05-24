import { combineReducers } from '@reduxjs/toolkit';

import silo from './silo/reducer';
import field from './field/reducer';
import events from './events/reducer';
import balances from './balances/reducer';

export default combineReducers({
  silo,
  field,
  events,
  balances
});

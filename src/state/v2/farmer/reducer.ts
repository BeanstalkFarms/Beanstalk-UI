import { combineReducers } from '@reduxjs/toolkit';

import silo from './silo/reducer';
import events from './events/reducer';

export default combineReducers({
  silo,
  events
});

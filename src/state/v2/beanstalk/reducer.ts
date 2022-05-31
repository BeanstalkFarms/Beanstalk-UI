import { combineReducers } from '@reduxjs/toolkit';

import fertilizer from './fertilizer/reducer';
import field from './field/reducer';
import silo from './silo/reducer';
import sun from './sun/reducer';

export default combineReducers({
  fertilizer,
  field,
  silo,
  sun,
});

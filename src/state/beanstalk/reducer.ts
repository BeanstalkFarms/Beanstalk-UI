import { combineReducers } from '@reduxjs/toolkit';

import barn from './barn/reducer';
import field from './field/reducer';
import silo from './silo/reducer';
import sun from './sun/reducer';

export default combineReducers({
  barn,
  field,
  silo,
  sun,
});

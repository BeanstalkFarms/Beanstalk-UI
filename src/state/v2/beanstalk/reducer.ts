import { combineReducers } from '@reduxjs/toolkit';

import sun from './sun/reducer';
import field from './field/reducer';

export default combineReducers({
  sun,
  field,
});

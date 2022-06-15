import { combineReducers } from '@reduxjs/toolkit';
import pools from './pools/reducer';
import token from './token/reducer';

export default combineReducers({
  pools,
  token,
});

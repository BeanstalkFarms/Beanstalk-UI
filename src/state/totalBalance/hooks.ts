import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { TotalBalanceState } from './reducer';

export function useTotalBalance(): TotalBalanceState {
  return useSelector((state: AppState) => state.totalBalance);
}

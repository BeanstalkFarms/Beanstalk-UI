import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { UserBalanceState } from './reducer';

export function useUserBalance(): UserBalanceState {
  return useSelector((state: AppState) => state.userBalance);
}

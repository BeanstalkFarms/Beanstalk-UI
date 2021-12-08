import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { AllowanceState } from './reducer';

export function useAllowances(): AllowanceState {
  return useSelector((state: AppState) => state.allowances);
}

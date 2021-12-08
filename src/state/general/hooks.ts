import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { GeneralState } from './reducer';

export function useGeneral(): GeneralState {
  return useSelector((state: AppState) => state.general);
}

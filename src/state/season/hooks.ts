import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { SeasonState } from './reducer';

export function useSeason(): SeasonState {
  return useSelector((state: AppState) => state.season);
}

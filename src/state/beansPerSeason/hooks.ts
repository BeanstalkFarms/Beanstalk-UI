import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { BeansPerSeasonState } from './reducer';

export function useBeansPerSeason(): BeansPerSeasonState {
  return useSelector((state: AppState) => state.beansPerSeason);
}

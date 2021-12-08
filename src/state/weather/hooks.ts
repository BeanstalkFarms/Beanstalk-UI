import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { WeatherState } from './reducer';

export function useWeather(): WeatherState {
  return useSelector((state: AppState) => state.weather);
}

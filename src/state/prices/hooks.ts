import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { PriceState } from './reducer';

export function usePrices(): PriceState {
  return useSelector((state: AppState) => state.prices);
}

import { focusAtom } from 'jotai/optics';
import { atom } from 'jotai';
import { OpticFor } from 'optics-ts';

export type IMarketChart = {
  type: 'depth' | 'listings' | 'selected-buy' | 'selected-sell';
};

const initialState: IMarketChart = {
  type: 'depth',
};

// ---------- MAIN STATE ATOM ----------
const marketChartAtom = atom<IMarketChart>(initialState);

// ---------- SUB-ATOMS ----------
// destructured from the main state atom

/**
 * whether
 */
export const marketChartType = focusAtom(
  marketChartAtom,
  (o: OpticFor<IMarketChart>) => o.prop('type')
);

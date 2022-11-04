import { atom } from 'jotai';

// UI STATE
type PartialOpenState = 'open' | 'closed' | 'partial';
const marketBottomTabs = atom<PartialOpenState>('closed');

export const setPodMarketBottomTabs = atom(
  null,
  (_get, set, openState: PartialOpenState) => {
    set(marketBottomTabs, openState);
  }
);

const podsOrderType = atom<'buy' | 'sell'>('buy');

export const setPodsOrderType = atom(
  null,
  (get, set) => {
    const currentOrderType = get(podsOrderType) === 'buy' ? 'sell' : 'buy';
    set(podsOrderType, currentOrderType);
  }
);

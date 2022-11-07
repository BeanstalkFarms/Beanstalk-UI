import { atom } from 'jotai';

// UI STATE
type PartialOpenState = 0 | 1 | 2;

export const marketBottomTabsAtom = atom<PartialOpenState>(0);
export const prevOpenStateAtom = atom(0);

export const setPodMarketBottomTabsAtom = atom(
  null,
  (_get, set, openState: PartialOpenState) => {
    set(marketBottomTabsAtom, openState);
  }
);

const podsOrderType = atom<'buy' | 'sell'>('buy');

export const setPodsOrderTypeAtom = atom(null, (get, set) => {
  const currentOrderType = get(podsOrderType) === 'buy' ? 'sell' : 'buy';
  set(podsOrderType, currentOrderType);
});

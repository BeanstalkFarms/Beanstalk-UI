import { focusAtom } from 'jotai/optics';
import { atom } from 'jotai';
import { OpticFor } from 'optics-ts';

type PartialOpenState = 0 | 1 | 2;

type PodMarketplaceUIState = {
  bottomTabs: PartialOpenState;
};

const initialState: PodMarketplaceUIState = {
  bottomTabs: 0,
};

const uiStateAtom = atom<PodMarketplaceUIState>(initialState);

export const marketBottomTabsAtom = focusAtom(
  uiStateAtom,
  (optics: OpticFor<PodMarketplaceUIState>) => optics.prop('bottomTabs')
);

import { useMemo } from 'react';
import { ERC20Token } from '~/classes/Token';
import { AddressMap } from '~/constants';
import { UNRIPE_TOKENS, UNRIPE_UNDERLYING_TOKENS } from '~/constants/tokens';
import useTokenList from '~/hooks/chain/useTokenList';

export default function useUnripeUnderlying() {
  const unripe     = useTokenList(UNRIPE_TOKENS);
  const underlying = useTokenList(UNRIPE_UNDERLYING_TOKENS);
  return useMemo(() => unripe.reduce<AddressMap<ERC20Token>>((prev, curr, index) => {
    prev[curr.address] = underlying[index];
    return prev;
  }, {}), [underlying, unripe]);
}

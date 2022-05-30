import { TokenOrTokenMap, TokensByAddress } from 'constants/v2';
import { useMemo } from 'react';
import Token from 'classes/Token';
import { useGetChainConstant } from './useChainConstant';

export default function useTokenMap(list: TokenOrTokenMap[]) : TokensByAddress {
  const getChainConstant = useGetChainConstant();
  return useMemo(() => list.reduce<TokensByAddress>(
    (acc, curr) => {
      const token = curr instanceof Token ? curr : getChainConstant(curr);
      if (token) acc[token.address] = token;
      return acc;
    },
    {}
  ), [
    list,
    getChainConstant,
  ]);
}

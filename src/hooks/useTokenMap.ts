import { useMemo } from 'react';
import { ChainConstant, TokenMap } from 'constants/index';
import Token from 'classes/Token';
import { useGetChainConstant } from './useChainConstant';

/**
 * 
 */
export default function useTokenMap(
  list: (Token | ChainConstant<Token>)[]
) : TokenMap {
  const getChainConstant = useGetChainConstant();
  return useMemo(() => list.reduce<TokenMap>(
    (acc, curr) => {
      // If this entry in the list is a Token and not a TokenMap, we
      // simply return the token. Otherwise we get the appropriate chain-
      // specific Token.
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

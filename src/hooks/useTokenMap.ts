import { useMemo } from 'react';
import { ChainConstant, TokenMap } from 'constants/index';
import Token from 'classes/Token';
import useGetChainToken from './useGetChainToken';

/**
 * 
 */
export default function useTokenMap(
  list: (Token | ChainConstant<Token>)[]
) : TokenMap {
  const getChainToken = useGetChainToken();
  return useMemo(
    () => list.reduce<TokenMap>(
      (acc, curr) => {
        // If this entry in the list is a Token and not a TokenMap, we
        // simply return the token. Otherwise we get the appropriate chain-
        // specific Token.
        const token = getChainToken(curr);
        if (token) acc[token.address] = token;
        return acc;
      },
      {}
    ),
    [
      list,
      getChainToken,
    ]
  );
}

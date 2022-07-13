import { useMemo } from 'react';
import { ChainConstant, TokenMap } from 'constants/index';
import Token from 'classes/Token';
import useGetChainToken from './useGetChainToken';

export default function useTokenMap<T extends Token>(
  list: (T | ChainConstant<T>)[]
) : TokenMap {
  const getChainToken = useGetChainToken();
  return useMemo(
    () => list.reduce<TokenMap<T>>(
      (acc, curr) => {
        // If this entry in the list is a Token and not a TokenMap, we
        // simply return the token. Otherwise we get the appropriate chain-
        // specific Token. This also dedupes tokens by address.
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

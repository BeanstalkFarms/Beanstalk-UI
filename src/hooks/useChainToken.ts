import Token from 'classes/Token';
import { TokenOrTokenMap } from 'constants/v2';
import { useCallback } from 'react';
import { useGetChainConstant } from './useChainConstant';

/**
 * Returns a callback that accepts a `TokenOrTokenMap`.
 * If `t` is a Token      return the token.
 * If `t` is a TokenMap   extract the appropriate Token instance via `getChainConstant()`.
 * 
 * This is a helper function to avoid repeated use of `t instanceof Token ? ... : ...`.
 */
export default function useGetChainToken() {
  const getChainConstant = useGetChainConstant();
  return useCallback(
    // I find the function expression much easier to parse here,
    // so going to break our usual preference for arrow functions. -SC
    // eslint-disable-next-line prefer-arrow-callback
    function getChainToken(t: TokenOrTokenMap) {
      return t instanceof Token ? t : getChainConstant(t);
    },
    [getChainConstant]
  )
}
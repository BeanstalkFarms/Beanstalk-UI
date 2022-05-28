import BigNumber from "bignumber.js";
import { Token } from "classes";
import { TokenOrTokenMap } from "constants/v2";
import { useSelector } from "react-redux";
import { AppState } from "state";
import useGetChainToken from "./useChainToken";

export type PreferredToken = {
  token: TokenOrTokenMap;
  minimum?: BigNumber;
}

type FallbackMode = 'use-best';

/**
 * Select a single `Token` from a list of `PreferredToken[]` based on
 * the user's current balances and Token configuration.
 * 
 * Example: when instantiating the Sow form, we want the form to use
 * BEAN by default if the user has some minimum number of Beans in their
 * balance. Otherwise we move on to ETH, etc.
 * 
 * `list` should be ordered according to preference.
 * 
 * @param list An ordered list of tokens to select from.
 * @param fallbackMode What to do if no tokens meet the minimum.
 *    `use-best` Default to the first token in the list.
 * @returns 
 */
const usePreferredToken = (list: PreferredToken[], fallbackMode : FallbackMode = 'use-best') => {
  const get = useGetChainToken();
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const index = list.findIndex((pt) => {
    const tok = get(pt.token);
    const min = pt.minimum || new BigNumber(tok.displayDecimals*100);
    const bal = balances[tok.address];
    console.debug(`[usePreferredToken] ${tok.symbol} ${tok.address} ${min.toString()} ${bal.toString()}`)
    return bal?.gte(min) || false;
  });
  console.debug(`[usePreferredToken] found: ${index}`)
  if (index > -1) return get(list[index].token);
  switch(fallbackMode) {
    default:
    case 'use-best':
      return get(list[0].token);
  }
}

export default usePreferredToken;
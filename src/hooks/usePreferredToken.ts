import BigNumber from "bignumber.js";
import { Token } from "classes";
import { SupportedChainId } from "constants/chains";
import { TokenOrTokenMap } from "constants/v2";
import { useSelector } from "react-redux";
import { AppState } from "state";
import { useNetwork } from "wagmi";

export type PreferredToken = {
  token: TokenOrTokenMap;
  minimum?: BigNumber;
}

type FallbackMode = 'use-best';

const usePreferredToken = (list: PreferredToken[], fallbackMode : FallbackMode = 'use-best') => {
  const { activeChain } = useNetwork();
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const index = list.findIndex((pt) => {
    const token = pt.token instanceof Token ? pt.token : pt.token[activeChain?.id || SupportedChainId.MAINNET];
    const min   = pt.minimum || new BigNumber(token.displayDecimals*100);
    return balances[token.address]?.gte(min) || false;
  });
  if (index > -1) return list[index].token;
  switch(fallbackMode) {
    default:
    case 'use-best':
      return list[0].token;
  }
}

export default usePreferredToken;
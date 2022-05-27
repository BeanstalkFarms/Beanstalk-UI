import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

export type SiloTokenBreakdown = {
  bdv: BigNumber;
  bdvByToken: { [address: string] : BigNumber; } 
}

const initState = (tokenAddresses: string[]) => ({
  bdv: new BigNumber(0),
  bdvByToken: tokenAddresses.reduce<SiloTokenBreakdown['bdvByToken']>(
    (prev, curr) => { 
      prev[curr] = new BigNumber(0);
      return prev;
    },
    {},
  ),
} as SiloTokenBreakdown);

/**
 * Breakdown the state of Silo Tokens.
 * 
 * A "Token State" is the state of a whitelisted Silo Token
 * within Beanstalk. 
 *  
 *    (1)--[deposited => withdrawn => claimable]-->(2)
 *    (2)--[circulating <-> wrapped]-->(1)
 * 
 * First we break things down by state, then by type of token.
 */
const useSiloTokenBreakdown = () => {
  const tokens = useSelector<AppState, AppState['_farmer']['silo']['tokens']>((state) => state._farmer.silo.tokens);
  const tokenAddresses = useMemo(() => Object.keys(tokens), [tokens]);
  return useMemo(() => 
    tokenAddresses.reduce((prev, curr) => {
      const t = tokens[curr];
      if (t) {
        prev.bdv = (
          prev.bdv
            .plus(t.deposited.bdv)
            // .plus(t.withdrawn.bdv)
            // .plus(t.circulating)
            // .plus(t.claimable)
            // .plus(t.wrapped)
        );
        // TODO: BDV conversion to $
        prev.deposited.bdv    = prev.deposited.bdv.plus(t.deposited.bdv);
        // prev.withdrawn.bdv    = prev.withdrawn.bdv.plus(t.withdrawn.bdv);
        // prev.circulating.bdv  = prev.circulating.bdv.plus(t.circulating);
        // prev.claimable.bdv    = prev.claimable.bdv.plus(t.claimable);
        // prev.wrapped.bdv      = prev.wrapped.bdv.plus(t.wrapped);
        prev.deposited.bdvByToken[curr] = prev.deposited.bdvByToken[curr].plus(t.deposited.bdv);
        // prev.withdrawn.bdvByToken[curr] = prev.withdrawn.bdvByToken[curr].plus(t.withdrawn.bdv);
      }
      return prev;
    }, {
      bdv:          new BigNumber(0),
      circulating:  initState(tokenAddresses),
      deposited:    initState(tokenAddresses),
      claimable:    initState(tokenAddresses),
      wrapped:      initState(tokenAddresses),
      withdrawn:    initState(tokenAddresses),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [tokenAddresses]);
};

export default useSiloTokenBreakdown;

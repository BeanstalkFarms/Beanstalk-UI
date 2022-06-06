import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useSiloTokenToUSD from './useSiloTokenToUSD';
import useWhitelist from './useWhitelist';

export type SiloStateBreakdown = {
  /**
   * The amount of token in the given State (DEPOSITED, etc.)
   * denominated in in that token. Ex. amount=0.005 BEAN:ETH LP. */
  value: BigNumber;
  /** 
   * The 
   */
  valueByToken: {
    [address: string] : BigNumber;
  } 
}

const initState = (tokenAddresses: string[]) => ({
  value: new BigNumber(0),
  valueByToken: tokenAddresses.reduce<SiloStateBreakdown['valueByToken']>(
    (prev, curr) => { 
      prev[curr] = new BigNumber(0);
      return prev;
    },
    {},
  ),
} as SiloStateBreakdown);

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
const useFarmerSiloBreakdown = () => {
  /**  */
  const balances = useSelector<AppState, AppState['_farmer']['silo']['tokens']>((state) => state._farmer.silo.tokens);
  /** All tokenAddresses currently available in balances */
  const getUSD = useSiloTokenToUSD();
  
  const whitelist = useWhitelist();
  const tokenAddresses = useMemo(() => Object.keys(whitelist), [whitelist]);

  //
  return useMemo(() => {
    console.debug('[useFarmerSiloBalances] running reducer');
    return tokenAddresses.reduce((prev, address) => {
      const token       = whitelist[address];
      const siloBalance = balances[address];

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        const [
          _depositedUsd,
          _withdrawnUsd,
        ] = [
          getUSD(token, siloBalance.deposited?.amount),
          getUSD(token, siloBalance.withdrawn?.amount)
        ];

        // console.debug('[useFarmerSiloBalances] running reducer:', token, _depositedUsd, _withdrawnUsd);

        prev.totalValue = (
          prev.totalValue
            .plus(_depositedUsd)
            .plus(_withdrawnUsd)
        );

        // Aggregate amounts of each State
        prev.deposited.value = prev.deposited.value.plus(_depositedUsd);
        prev.withdrawn.value = prev.withdrawn.value.plus(_withdrawnUsd);

        // Aggregate amount of each Token in this State
        prev.deposited.valueByToken[address] = prev.deposited.valueByToken[address].plus(_depositedUsd);
        prev.withdrawn.valueByToken[address] = prev.withdrawn.valueByToken[address].plus(_withdrawnUsd);
      }
      return prev;
    }, {
      /** The total USD value of all tokens in the Silo. */
      totalValue:   new BigNumber(0),
      circulating:  initState(tokenAddresses),
      deposited:    initState(tokenAddresses),
      claimable:    initState(tokenAddresses),
      wrapped:      initState(tokenAddresses),
      withdrawn:    initState(tokenAddresses),
    });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [tokenAddresses, balances]);
};

export default useFarmerSiloBreakdown;

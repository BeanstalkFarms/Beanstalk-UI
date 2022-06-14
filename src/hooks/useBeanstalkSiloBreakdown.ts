import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AddressMap } from 'constants/index';
import useSiloTokenToUSD from './currency/useSiloTokenToUSD';
import useWhitelist from './useWhitelist';

// -----------------
// Types and Helpers
// -----------------

export type SiloStateBreakdown = {
  /**
   * The amount of token in the given State (DEPOSITED, etc.)
   * denominated in in that token. Ex. amount=0.005 BEAN:ETH LP. */
  value: BigNumber;
  /**
   * The
   */
  valueByToken: AddressMap<BigNumber>;
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

// -----------------
// Hooks
// -----------------

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
export default function useBeanstalkSiloBreakdown() {
  // Constants
  const WHITELIST = useWhitelist();
  const WHITELIST_ADDRS = useMemo(() => Object.keys(WHITELIST), [WHITELIST]);

  //
  const balances = useSelector<AppState, AppState['_beanstalk']['silo']['tokens']>((state) => state._beanstalk.silo.tokens);
  const getUSD = useSiloTokenToUSD();

  return useMemo(() => {
    console.debug('[useFarmerSiloBalances] running reducer');
    return WHITELIST_ADDRS.reduce((prev, address) => {
      const TOKEN       = WHITELIST[address];
      const siloBalance = balances[address];

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        const [
          _depositedUsd,
          _withdrawnUsd,
        ] = [
          getUSD(TOKEN, siloBalance.deposited?.amount),
          getUSD(TOKEN, siloBalance.withdrawn?.amount)
        ];

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
      circulating:  initState(WHITELIST_ADDRS),
      deposited:    initState(WHITELIST_ADDRS),
      claimable:    initState(WHITELIST_ADDRS),
      wrapped:      initState(WHITELIST_ADDRS),
      withdrawn:    initState(WHITELIST_ADDRS),
    });
  },
  [
    WHITELIST,
    WHITELIST_ADDRS,
    balances,
    getUSD,
  ]);
}

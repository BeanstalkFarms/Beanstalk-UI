import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AddressMap, ZERO_BN } from 'constants/index';
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
  byToken: AddressMap<[amount: BigNumber, value: BigNumber]>;
}

const initState = (tokenAddresses: string[]) => ({
  value: new BigNumber(0),
  byToken: tokenAddresses.reduce<SiloStateBreakdown['byToken']>(
    (prev, curr) => { 
      prev[curr] = [new BigNumber(0), new BigNumber(0)];
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
const TOKEN_STATE = [
  'deposited',
  'withdrawn',
  'claimable',
  'wrapped',
  'circulating'
] as const;

export default function useFarmerSiloBreakdown() {
  // Constants
  const WHITELIST = useWhitelist();
  const WHITELIST_ADDRS = useMemo(() => Object.keys(WHITELIST), [WHITELIST]);

  //
  const siloBalances  = useSelector<AppState, AppState['_farmer']['silo']['tokens']>((state) => state._farmer.silo.tokens);
  const tokenBalances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const getUSD = useSiloTokenToUSD();

  return useMemo(() => {
    console.debug('[useFarmerSiloBalances] running reducer');
    return WHITELIST_ADDRS.reduce((prev, address) => {
      const TOKEN        = WHITELIST[address];
      const siloBalance  = siloBalances[address];
      const tokenBalance = tokenBalances[address] || ZERO_BN;

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        const amountByState = {
          deposited:   siloBalance.deposited?.amount,
          withdrawn:   siloBalance.withdrawn?.amount,
          claimable:   siloBalance.claimable?.amount,
          wrapped:     new BigNumber(0),
          circulating: tokenBalance,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited?.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn?.amount),
          claimable:   getUSD(TOKEN, siloBalance.claimable?.amount),
          wrapped:     getUSD(TOKEN, new BigNumber(0)),
          circulating: getUSD(TOKEN, tokenBalance),
        };

        prev.totalValue = (
          prev.totalValue
            .plus(
              Object.values(usdValueByState).reduce((p, c) => p.plus(c))
            )
        );

        // Aggregate amounts of each State
        TOKEN_STATE.forEach((s) => {
          prev[s].value = prev[s].value.plus(usdValueByState[s]);
          prev[s].byToken[address][0] = prev[s].byToken[address][0].plus(amountByState[s]);
          prev[s].byToken[address][1] = prev[s].byToken[address][1].plus(usdValueByState[s]);
        });

        // prev.deposited.value = prev.deposited.value.plus(_depositedUsd);
        // prev.withdrawn.value = prev.withdrawn.value.plus(_withdrawnUsd);
        // prev.claimable.value = prev.claimable.value.plus(_claimableUsd);
        // prev.wrapped.value   = prev.wrapped.value.plus(_wrappedUsd);
        // prev.circulating.value = prev.circulating.value.plus(_circulatingUsd);

        // Aggregate amount of each Token in this State
        // prev.deposited.byToken[address] = prev.deposited.byToken[address].plus(_depositedUsd);
        // prev.withdrawn.byToken[address] = prev.withdrawn.byToken[address].plus(_withdrawnUsd);
        // prev.claimable.byToken[address] = prev.claimable.byToken[address].plus(_claimableUsd);
        // prev.wrapped.byToken[address]   = prev.wrapped.byToken[address].plus(_wrappedUsd);
        // prev.circulating.byToken[address] = prev.circulating.byToken[address].plus(_circulatingUsd);
      }
      return prev;
    }, {
      /** The total USD value of all tokens in the Silo. */
      totalValue:   new BigNumber(0),
      deposited:    initState(WHITELIST_ADDRS),
      withdrawn:    initState(WHITELIST_ADDRS),
      claimable:    initState(WHITELIST_ADDRS),
      wrapped:      initState(WHITELIST_ADDRS),
      circulating:  initState(WHITELIST_ADDRS),
    });
  },
  [
    WHITELIST,
    WHITELIST_ADDRS,
    siloBalances,
    tokenBalances,
    getUSD,
  ]);
}

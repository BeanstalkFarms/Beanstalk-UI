import BigNumber from 'bignumber.js';
import { AddressMap, ZERO_BN } from 'constants/index';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useSiloTokenToUSD from './currency/useSiloTokenToUSD';
import useWhitelist from './useWhitelist';

// -----------------
// Types and Helpers
// -----------------

const TOKEN_STATE = [
  'deposited',
  'withdrawn',
] as const;

// SiloStateBreakdown
export type SiloStateBreakdown = {
  /**
   * The amount of token in the given State (DEPOSITED, etc.)
   * denominated in in that token. Ex. amount=0.005 BEAN:ETH LP. */
  value: BigNumber;
  /** 
   * A mapping of address => { amount, value } for Tokens in this State.
   * Ex. I have a Bean deposit: 0xBEAN => { amount: 100, value: 101 } if 1 BEAN = $1.01
   */
  byToken: AddressMap<{ amount: BigNumber, value: BigNumber }>;
}

const _initState = (tokenAddresses: string[]) => ({
  value: new BigNumber(0),
  byToken: tokenAddresses.reduce<SiloStateBreakdown['byToken']>(
    (prev, curr) => { 
      prev[curr] = {
        amount: new BigNumber(0),
        value: new BigNumber(0)
      };
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
  const siloBalances = useSelector<AppState, AppState['_beanstalk']['silo']['balances']>((state) => state._beanstalk.silo.balances);
  const getUSD = useSiloTokenToUSD();

  return useMemo(() => 
    // console.debug('[useBeanstalkSiloBreakdown] running reducer');
     WHITELIST_ADDRS.reduce((prev, address) => {
      const TOKEN        = WHITELIST[address];
      const siloBalance  = siloBalances[address];

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        const amountByState = {
          deposited:   siloBalance.deposited?.amount,
          withdrawn:   siloBalance.withdrawn?.amount,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited?.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn?.amount),
        };

        // Aggregate value of all states.
        prev.totalValue = (
          prev.totalValue
            .plus(
              TOKEN_STATE.reduce((p, c) => p.plus(usdValueByState[c]), ZERO_BN)
            )
        );

        // Aggregate amounts of each State
        TOKEN_STATE.forEach((s) => {
          prev.states[s].value = prev.states[s].value.plus(usdValueByState[s]);
          prev.states[s].byToken[address].amount = prev.states[s].byToken[address].amount.plus(amountByState[s]);
          prev.states[s].byToken[address].value  = prev.states[s].byToken[address].value.plus(usdValueByState[s]);
        });
      }
      return prev;
    }, {
      /** The total USD value of all tokens in the Silo. */
      totalValue:   new BigNumber(0),
      /** */
      states: {
        deposited: _initState(WHITELIST_ADDRS),
        withdrawn: _initState(WHITELIST_ADDRS),
      }
    }),  
  [
    WHITELIST,
    WHITELIST_ADDRS,
    siloBalances,
    getUSD,
  ]);
}

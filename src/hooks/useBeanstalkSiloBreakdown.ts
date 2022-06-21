import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { AddressMap, ZERO_BN } from 'constants/index';
import useSiloTokenToUSD from './currency/useSiloTokenToUSD';
import useGeneralizedWhitelist from './useWhitelist';

// -----------------
// Types and Helpers
// -----------------

const TOKEN_STATE = [
  'deposited',
  'withdrawn',
  'wrapped',
  'circulating'
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

const initState = (tokenAddresses: string[]) => ({
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
  const WHITELIST = useGeneralizedWhitelist();
  const WHITELIST_ADDRS = useMemo(() => Object.keys(WHITELIST), [WHITELIST]);

  //
  const siloBalances = useSelector<AppState, AppState['_beanstalk']['silo']['tokens']>((state) => state._beanstalk.silo.tokens);
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
          wrapped:     new BigNumber(0),
          circulating: tokenBalance,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited?.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn?.amount),
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
          prev[s].byToken[address].amount = prev[s].byToken[address].amount.plus(amountByState[s]);
          prev[s].byToken[address].value  = prev[s].byToken[address].value.plus(usdValueByState[s]);
        });
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

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
   * The aggregate USD value of tokens in this State.
   * Ex. I have $100 Deposited.
   */
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

  // Balances
  const siloBalances  = useSelector<AppState, AppState['_farmer']['silo']['balances']>((state) => state._farmer.silo.balances);
  const tokenBalances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);

  // Helpers
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
          wrapped:     new BigNumber(0), // FIXME
          circulating: tokenBalance,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited?.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn?.amount),
          claimable:   getUSD(TOKEN, siloBalance.claimable?.amount),
          wrapped:     getUSD(TOKEN, new BigNumber(0)),
          circulating: getUSD(TOKEN, tokenBalance),
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
          prev.states[s].value                   = prev.states[s].value.plus(usdValueByState[s]);
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
        deposited:    _initState(WHITELIST_ADDRS),
        withdrawn:    _initState(WHITELIST_ADDRS),
        claimable:    _initState(WHITELIST_ADDRS),
        wrapped:      _initState(WHITELIST_ADDRS),
        circulating:  _initState(WHITELIST_ADDRS),
      }
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

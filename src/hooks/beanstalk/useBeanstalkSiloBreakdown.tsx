import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AddressMap, TokenMap, ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import useSiloTokenToFiat from './useSiloTokenToFiat';
import useWhitelist from './useWhitelist';
import { BeanstalkSiloBalance } from '~/state/beanstalk/silo';

// -----------------
// Types and Helpers
// -----------------

const TOKEN_STATE = [
  'pooled',
  'deposited',
  'withdrawn',
  'farmable',
  'ripe',
  'budget'
] as const;

export type SiloTokenState = {
  [state: string]: {
    /** USD value. */
    value: BigNumber;
    /** Token amount. */
    amount: BigNumber;
  }
}

// SiloStateBreakdown
export type SiloTokenBreakdown = {
  tokens: AddressMap<{ amount: BigNumber, value: BigNumber, byState: SiloTokenState }>;
}

const _initState = (tokenAddresses: string[], siloBalances: TokenMap<BeanstalkSiloBalance>) => tokenAddresses.reduce<SiloTokenBreakdown['tokens']>((prev, address) => {
  if (siloBalances && siloBalances[address]) {
    prev[address] = {
      value: new BigNumber(0),
      amount: new BigNumber(0),
      byState: TOKEN_STATE
        // Don't show every state for every token
        .filter((state) => siloBalances[address][state] !== undefined)
        .reduce<SiloTokenState>(
        (_prev, state) => {
          _prev[state] = {
            value: new BigNumber(0),
            amount: new BigNumber(0),
          };
          return _prev;
        },
        {},
      ),
    };
  }
  return prev;
}, {}) as SiloTokenBreakdown['tokens'];

// -----------------
// Hooks
// -----------------
/**
 * Breakdown the state of Silo Tokens.
 *
 * For each Whitelisted token, we grab the amount and value
 * of that token for each of its states.
 *
 * A token's state can be:
 * - pooled
 * - deposited
 * - withdrawn & claimable
 * - farm & circulating
 * - ripe
 * - budget
 */

export default function useBeanstalkSiloBreakdown() {
  // Constants
  const WHITELIST = useWhitelist();
  const WHITELIST_ADDRS = useMemo(() => Object.keys(WHITELIST), [WHITELIST]);

  // 
  const siloBalances = useSelector<AppState, AppState['_beanstalk']['silo']['balances']>((state) => state._beanstalk.silo.balances);
  const getUSD = useSiloTokenToFiat();

  return useMemo(() =>
     WHITELIST_ADDRS.reduce((prev, address) => {
      const TOKEN        = WHITELIST[address];
      const siloBalance  = siloBalances[address];

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        const amountByState = {
          deposited:   siloBalance.deposited?.amount,
          withdrawn:   siloBalance.withdrawn?.amount,
          pooled:      siloBalance.pooled ? siloBalance.pooled?.amount : undefined,
          ripe:        siloBalance.ripe ? siloBalance.ripe?.amount : undefined,
          budget:      siloBalance.budget ? siloBalance.budget?.amount : undefined,
          farmable:    siloBalance.farmable ? siloBalance.farmable?.amount : undefined,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited?.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn?.amount),
          pooled:      siloBalance.pooled   ? getUSD(TOKEN, siloBalance.pooled?.amount) : undefined,
          ripe:        siloBalance.ripe     ? getUSD(TOKEN, siloBalance.ripe?.amount) : undefined,
          budget:      siloBalance.budget   ? getUSD(TOKEN, siloBalance.budget?.amount) : undefined,
          farmable:    siloBalance.farmable ? getUSD(TOKEN, siloBalance.farmable?.amount) : undefined,
        };

        // Aggregate value of all states.
        prev.totalValue = (
          prev.totalValue
            .plus(
              TOKEN_STATE.reduce((p, c) => p.plus(usdValueByState[c] || ZERO_BN), ZERO_BN)
            )
        );

        // Aggregate amounts of each Token
        prev.tokens[address].amount = prev.tokens[address].amount.plus(
          TOKEN_STATE.reduce((p, c) => p.plus(
            amountByState[c] || ZERO_BN), ZERO_BN
          )
        );
        prev.tokens[address].value = prev.tokens[address].value.plus(
          TOKEN_STATE.reduce((p, c) => p.plus(
            usdValueByState[c] || ZERO_BN), ZERO_BN
          )
        );

        // Aggregate amounts of each State
        TOKEN_STATE.forEach((s) => {
          if (usdValueByState[s] !== undefined) {
            prev.tokens[address].byState[s].value = prev.tokens[address].byState[s].value.plus(usdValueByState[s] as BigNumber);
            prev.tokens[address].byState[s].amount = prev.tokens[address].byState[s].amount.plus(amountByState[s] as BigNumber);
          }
        });
      }
      return prev;
    }, {
      /** The total USD value of all tokens in the Silo. */
      totalValue:   new BigNumber(0),
      /** */
      tokens: _initState(WHITELIST_ADDRS, siloBalances),
    }),
  [
    WHITELIST,
    WHITELIST_ADDRS,
    siloBalances,
    getUSD,
  ]);
}

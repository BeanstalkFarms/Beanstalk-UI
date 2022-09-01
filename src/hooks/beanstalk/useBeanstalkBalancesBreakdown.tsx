import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AddressMap, TokenMap, ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import useSiloTokenToFiat from './useSiloTokenToFiat';
import useWhitelist from './useWhitelist';
import { BeanstalkSiloBalance } from '~/state/beanstalk/silo';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import { BEAN } from '~/constants/tokens';
import useUnripeUnderlyingMap from '~/hooks/beanstalk/useUnripeUnderlying';

// -----------------
// Types and Helpers
// -----------------

export const STATE_CONFIG = {
  pooled: [
    'Pooled',
    '#8CB4CF',
    (name: string) => `${name} in all liquidity pools.`
  ],
  deposited: [
    'Deposited',
    BeanstalkPalette.logoGreen, 
    (name: string) => `${name} that are Deposited in the Silo.`
  ],
  withdrawn: [
    'Withdrawn',
    '#E17E76', 
    (name: string) => `${name} being Withdrawn from the Silo. At the end of the current Season, Withdrawn assets become Claimable.`
  ],
  farmable: [
    'Farm & Circulating',
    BeanstalkPalette.lightBlue, 
    (name: string) => `Farm ${name} are stored in Beanstalk. Circulating ${name} are in Farmers' wallets.`,
  ],
  ripe: [
    'Ripe',
    '#DFB385', 
    (name: string) => `${name} minted as Fertilizer is sold. Ripe assets are the assets underlying Unripe assets.`
  ],
  budget: [
    'Budget',
    BeanstalkPalette.supportGreen,
    (name: string) => `${name} in the BFM and BSM wallets.`,
  ],
} as const;

export type StateID = keyof typeof STATE_CONFIG;
export const STATE_IDS = Object.keys(STATE_CONFIG) as StateID[];

export type SiloTokenState = {
  [state: string]: {
    /** USD value. */
    value: BigNumber | undefined;
    /** Token amount. */
    amount: BigNumber | undefined;
  }
}

// SiloStateBreakdown
export type SiloTokenBreakdown = {
  tokens: AddressMap<{ amount: BigNumber, value: BigNumber, byState: SiloTokenState }>;
}

const _initState = (tokenAddresses: string[], siloBalances: TokenMap<BeanstalkSiloBalance>) => tokenAddresses.reduce<SiloTokenBreakdown['tokens']>((prev, address) => {
  if (siloBalances && siloBalances[address]) {
    prev[address] = {
      value:  ZERO_BN,
      amount: ZERO_BN,
      byState: STATE_IDS
        // Don't show every state for every token
        // .filter((state) => siloBalances[address][state] !== undefined)
        .reduce<SiloTokenState>((_prev, state) => {
          _prev[state] = {
            value:  undefined,
            amount: undefined,
          };
          return _prev;
        },
        {}
      )
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

  const poolState = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const beanSupply = useSelector<AppState, AppState['_bean']['token']['supply']>((state) => state._bean.token.supply);
  const unripeTokenState = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);
  const multisigBalances = useSelector<AppState, AppState['_beanstalk']['governance']['multisigBalances']>((state) => state._beanstalk.governance.multisigBalances);

  const getChainToken = useGetChainToken();
  const Bean = getChainToken(BEAN);
  const unripeToRipe = useUnripeUnderlyingMap('unripe');
  const ripeToUnripe = useUnripeUnderlyingMap('ripe');

  return useMemo(() =>
     WHITELIST_ADDRS.reduce((prev, address) => {
      const TOKEN        = WHITELIST[address];
      const siloBalance  = siloBalances[address];

      // Ensure we've loaded a Silo Balance for this token.
      if (siloBalance) {
        let ripe;
        let budget;
        let pooled;
        let farmable;

        // Handle: Ripe Tokens (Add Ripe state to BEAN and BEAN:3CRV)
        if (ripeToUnripe[address]) {
          const unripeToken = unripeTokenState[ripeToUnripe[address].address];
          if (unripeToken) ripe = unripeToken.underlying; // "ripe" is another word for "underlying"
        }

        /// Handle: Unripe Tokens
        if (unripeToRipe[address]) {
          const unripeToken = unripeTokenState[address];
          if (unripeToken) {
            farmable = (
              unripeToken.supply
                .minus(siloBalance.deposited.amount)
                .minus(siloBalance.withdrawn.amount)
            );
          }
        }

        // Handle: BEAN
        if (TOKEN === Bean) {
          budget = Object.values(multisigBalances).reduce((_prev, curr) => _prev.plus(curr), ZERO_BN);
          pooled = Object.values(poolState).reduce((_prev, curr) => _prev.plus(curr.reserves[0]), ZERO_BN);
          farmable = (
            beanSupply
              .minus(budget)
              .minus(pooled)
              .minus(ripe || ZERO_BN)
              .minus(siloBalance.deposited.amount)
              .minus(siloBalance.withdrawn.amount)
          );
        }

        // Handle: LP Tokens
        if (poolState[address]) {
          farmable = (
            poolState[address].supply
              .minus(siloBalance.deposited.amount)
              .minus(siloBalance.withdrawn.amount)
              .minus(ripe || ZERO_BN)
          );
        }

        const amountByState = {
          deposited:   siloBalance.deposited?.amount,
          withdrawn:   siloBalance.withdrawn?.amount,
          pooled:      pooled,
          ripe:        ripe,
          budget:      budget,
          farmable:    farmable,
        };
        const usdValueByState = {
          deposited:   getUSD(TOKEN, siloBalance.deposited.amount),
          withdrawn:   getUSD(TOKEN, siloBalance.withdrawn.amount),
          pooled:      pooled   ? getUSD(TOKEN, pooled) : undefined,
          ripe:        ripe     ? getUSD(TOKEN, ripe) : undefined,
          budget:      budget   ? getUSD(TOKEN, budget) : undefined,
          farmable:    farmable ? getUSD(TOKEN, farmable) : undefined,
        };

        // Aggregate value of all states.
        prev.totalValue = (
          prev.totalValue
            .plus(
              STATE_IDS.reduce((p, c) => p.plus(usdValueByState[c] || ZERO_BN), ZERO_BN)
            )
        );

        // Aggregate amounts of each Token
        prev.tokens[address].amount = prev.tokens[address].amount.plus(
          STATE_IDS.reduce((p, c) => p.plus(
            amountByState[c] || ZERO_BN), ZERO_BN
          )
        );
        prev.tokens[address].value = prev.tokens[address].value.plus(
          STATE_IDS.reduce((p, c) => p.plus(
            usdValueByState[c] || ZERO_BN), ZERO_BN
          )
        );

        // Aggregate amounts of each State
        STATE_IDS.forEach((s) => {
          console.debug('[STATE_IDS] amountByState', amountByState);
          if (amountByState[s] !== undefined) {
            prev.tokens[address].byState[s].value  = (prev.tokens[address].byState[s].value || ZERO_BN).plus(usdValueByState[s] as BigNumber);
            prev.tokens[address].byState[s].amount = (prev.tokens[address].byState[s].amount || ZERO_BN).plus(amountByState[s] as BigNumber);
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
  [WHITELIST_ADDRS, siloBalances, WHITELIST, ripeToUnripe, unripeToRipe, Bean, poolState, getUSD, unripeTokenState, multisigBalances, beanSupply]);
}

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BEAN_TO_SEEDS, BEAN_TO_STALK, ONE_BN, TokenMap, ZERO_BN } from '~/constants';
import { bigNumberResult } from '~/util/Ledger';
import { tokenResult, toStringBaseUnitBN } from '~/util';
import { BEAN, BEAN_CRV3_LP, SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import { useGetChainConstant } from '~/hooks/chain/useChainConstant';
import { resetBeanstalkSilo, updateBeanstalkSilo } from './actions';
import { BeanstalkSiloBalance } from './index';
import ALL_POOLS from '~/constants/pools';
import useChainId from '~/hooks/chain/useChainId';
import { AppState } from '~/state';

export const useFetchBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();
  const FULL_WHITELIST = useWhitelist();
  const WHITELIST = FULL_WHITELIST;
  const chainId = useChainId();
  const poolState = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const beanSupply = useSelector<AppState, AppState['_bean']['token']['supply']>((state) => state._bean.token.supply);
  const unripeTokenState = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);

  /// 
  const getChainConstant = useGetChainConstant();
  const Bean = getChainConstant(BEAN);
  const Bean3CRV = getChainConstant(BEAN_CRV3_LP);
  const urBean = getChainConstant(UNRIPE_BEAN);
  const urBean3CRV = getChainConstant(UNRIPE_BEAN_CRV3);

  /// Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH: whitelist = ', WHITELIST);

      const multiSigs = [
        // Beanstalk Farms Multi-sig (BFM)
        '0x21DE18B6A8f78eDe6D16C50A167f6B222DC08DF7',
        // Bean Sprout Multi-sig (BSM)
        '0xb7ab3f0667eFF5e2299d39C23Aa0C956e8982235'
      ];

      const [
        // 0
        stalkTotal,
        seedsTotal,
        rootsTotal,
        earnedBeansTotal,
        bfmBeansTotal,
        bsmBeansTotal,
        // 4
        poolBalancesTotal,
        // 5
        withdrawSeasons,
      ] = await Promise.all([
        // 0
        beanstalk.totalStalk().then(tokenResult(STALK)),  // Includes Stalk from Earned Beans.
        beanstalk.totalSeeds().then(tokenResult(SEEDS)),  // 
        beanstalk.totalRoots().then(bigNumberResult),     //
        beanstalk.totalEarnedBeans().then(tokenResult(BEAN)),
        beanstalk.getBalance(multiSigs[0], BEAN[1].address).then(tokenResult(BEAN)),
        beanstalk.getBalance(multiSigs[1], BEAN[1].address).then(tokenResult(BEAN)),
        // 4
        Promise.all(
          Object.keys(WHITELIST).map((addr) => (
            Promise.all([
              // FIXME: duplicate tokenResult optimization
              beanstalk.getTotalDeposited(addr).then(tokenResult(WHITELIST[addr])),
              beanstalk.getTotalWithdrawn(addr).then(tokenResult(WHITELIST[addr])),
              // BEAN will always have a fixed BDV of 1,
              // skip to save a network request
              WHITELIST[addr] === Bean 
                ? ONE_BN
                : beanstalk
                    .bdv(addr, toStringBaseUnitBN(1, WHITELIST[addr].decimals))
                    .then(tokenResult(BEAN))
                    .catch((err) => {
                      console.error(`Failed to fetch BDV: ${addr}`);
                      console.error(err);
                      throw err;
                    }),
              // Only Bean and Bean:3CRV have Ripe tokens
              WHITELIST[addr] === Bean || WHITELIST[addr] === Bean3CRV
                ? WHITELIST[addr] === Bean
                  ? beanstalk.getTotalUnderlying(UNRIPE_BEAN[1].address).then(tokenResult(WHITELIST[addr]))
                  : beanstalk.getTotalUnderlying(UNRIPE_BEAN_CRV3[1].address).then(tokenResult(WHITELIST[addr]))
                : ZERO_BN
            ]).then((data) => ({
              token: addr.toLowerCase(),
              deposited: data[0],
              withdrawn: data[1],
              bdvPerToken: data[2],
              ripe: data[3]
            }))
          ))
        ),
        // 5
        beanstalk.withdrawFreeze().then(bigNumberResult),
      ] as const);

      console.debug('[beanstalk/silo/useBeanstalkSilo] RESULT', [stalkTotal, seedsTotal, poolBalancesTotal[0], poolBalancesTotal[0].deposited.toString(), withdrawSeasons]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const activeStalkTotal = stalkTotal;
      const earnedStalkTotal = earnedBeansTotal.times(BEAN_TO_STALK);
      const earnedSeedTotal  = earnedBeansTotal.times(BEAN_TO_SEEDS);

      /// Aggregate balances
      const balances = poolBalancesTotal.reduce((agg, curr) => {
        agg[curr.token] = {
          bdvPerToken: curr.bdvPerToken,
          deposited: {
            amount: curr.deposited,
          },
          withdrawn: {
            amount: curr.withdrawn,
          }
        };

        // Add Ripe state to BEAN and BEAN:3CRV
        if (WHITELIST[curr.token] === Bean || WHITELIST[curr.token] === Bean3CRV) {
          agg[curr.token].ripe = { amount: curr.ripe };
        }

        /// BEAN SPECIFIC STATES
        if (WHITELIST[curr.token] === Bean) {
          // Budget Beans
          const beansInMultiSig = bsmBeansTotal.plus(bfmBeansTotal);
          agg[curr.token].budget = { amount: beansInMultiSig };

          // Pooled Beans
          const POOL_ADDRESSES = Object.keys(ALL_POOLS[chainId]);
          // sum the bean reserves for each pool
          const totalPooledBeans = POOL_ADDRESSES.reduce((prev, poolAddr) => {
            const reserves = poolState[poolAddr]?.reserves;
            if (reserves) {
              return prev.plus(reserves[0]);
            }
            return prev;
          }, ZERO_BN);
          agg[curr.token].pooled = { amount: totalPooledBeans };

          // Farm + Circulating
          if (beanSupply) {
            agg[curr.token].farmPlusCirculating = {
              amount: beanSupply
                .minus(beansInMultiSig)
                .minus(totalPooledBeans)
                .minus(curr.ripe)
                .minus(curr.deposited)
                .minus(curr.withdrawn)
              // TODO: subtract claimable
            };
          }
        }

        // Farm + Circulating for Unripe Tokens
        if (WHITELIST[curr.token] === urBean || WHITELIST[curr.token] === urBean3CRV) {
          agg[curr.token].farmPlusCirculating = {
            amount: unripeTokenState[curr.token]?.supply
              .minus(curr.deposited)
              .minus(curr.withdrawn)
          };
        }

        // Farm + Circulating for LP Tokens
        if (poolState[curr.token]) {
          agg[curr.token].farmPlusCirculating = {
            amount: poolState[curr.token].supply
              .minus(curr.deposited)
              .minus(curr.withdrawn)
              .minus(curr.ripe)
          };
        }

        return agg;
      }, {} as TokenMap<BeanstalkSiloBalance>);

      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateBeanstalkSilo({
        // Balances
        balances,
        // Rewards
        beans: {
          earned: earnedBeansTotal,
          total:  balances[Bean.address].deposited.amount,
        },
        stalk: {
          active: activeStalkTotal,
          earned: earnedStalkTotal,
          grown:  ZERO_BN,
          total:  activeStalkTotal.plus(ZERO_BN),
        },
        seeds: {
          active: seedsTotal,
          earned: earnedSeedTotal,
          total:  seedsTotal.plus(earnedSeedTotal),
        },
        roots: {
          total:  rootsTotal,
        },
        // Metadata
        withdrawSeasons: withdrawSeasons
      }));
    }
  }, [beanstalk, WHITELIST, dispatch, Bean, Bean3CRV, urBean, urBean3CRV, chainId, beanSupply, poolState, unripeTokenState]);

  const clear = useCallback(() => {
    console.debug('[beanstalk/silo/useBeanstalkSilo] CLEAR');
    dispatch(resetBeanstalkSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const BeanstalkSiloUpdater = () => {
  const [fetch, clear] = useFetchBeanstalkSilo();

  useEffect(() => {
    clear();
    fetch();
  }, [clear, fetch]);

  return null;
};

export default BeanstalkSiloUpdater;

import { useCallback, useEffect } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK,  ONE_BN,  TokenMap, ZERO_BN } from '~/constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from '~/util/Ledger';
import { tokenResult, toStringBaseUnitBN } from '~/util/index';
import { BEAN, SEEDS, STALK } from '~/constants/tokens';
import { useBeanstalkContract } from '~/hooks/useContract';
import { BeanstalkReplanted } from '~/generated/index';
import useWhitelist from '~/hooks/useWhitelist';
import { useGetChainConstant } from '~/hooks/useChainConstant';
import { resetBeanstalkSilo, updateBeanstalkSilo } from './actions';
import { BeanstalkSiloBalance } from './index';

export const useFetchSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract() as unknown as BeanstalkReplanted;
  const FULL_WHITELIST = useWhitelist();
  const WHITELIST = FULL_WHITELIST;

  /// 
  const getChainConstant = useGetChainConstant();
  const Bean = getChainConstant(BEAN);

  /// Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH: whitelist = ', WHITELIST);

      const [
        // 0
        stalkTotal,
        seedsTotal,
        rootsTotal,
        earnedBeansTotal,
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
                    })
            ]).then((data) => ({
              token: addr.toLowerCase(),
              deposited: data[0],
              withdrawn: data[1],
              bdvPerToken: data[2],
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
  }, [beanstalk, WHITELIST, dispatch, Bean]);

  const clear = useCallback(() => {
    console.debug('[beanstalk/silo/useBeanstalkSilo] CLEAR');
    dispatch(resetBeanstalkSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const BeanstalkSiloUpdater = () => {
  const [fetch, clear] = useFetchSilo();

  useEffect(() => {
    clear();
    fetch();
  }, [clear, fetch]);

  return null;
};

export default BeanstalkSiloUpdater;

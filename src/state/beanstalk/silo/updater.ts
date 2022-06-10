import { useCallback, useEffect } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK, ZERO_BN } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from 'util/LedgerUtilities';
import { tokenResult } from 'util/TokenUtilities';

import { BEAN, SEEDS, STALK } from 'constants/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';

export const useBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH');

      const [
        stalkTotal,
        seedsTotal,
        rootsTotal,
        earnedBeansTotal,
        depositedBeansTotal,
        // withdrawnBeansTotal,
      ] = await Promise.all([
        beanstalk.totalStalk().then(tokenResult(STALK)),
        beanstalk.totalSeeds().then(tokenResult(SEEDS)),
        beanstalk.totalRoots().then(bigNumberResult),
        beanstalk.totalFarmableBeans().then(tokenResult(BEAN)),   // internally, earned == farmable 
        beanstalk.totalDepositedBeans().then(tokenResult(BEAN)),
        // beanstalk.totalWithdrawnBeans().then(tokenResult(BEAN)),  // 
        // beanstalk.withdrawSeasons().then(bigNumberResult)
      ] as const);

      console.debug('[beanstalk/silo/useBeanstalkSilo] RESULT', [stalkTotal, seedsTotal]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const earnedStalkTotal = earnedBeansTotal.times(BEAN_TO_STALK);
      const activeStalkTotal = stalkTotal.plus(earnedStalkTotal);
      const earnedSeedTotal  = earnedBeansTotal.times(BEAN_TO_SEEDS);

      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateBeanstalkSiloAssets({
        beans: {
          earned: earnedBeansTotal,
          total:  depositedBeansTotal,
        },
        stalk: {
          active: activeStalkTotal,
          earned: earnedStalkTotal,
          grown:  ZERO_BN,
          total:  activeStalkTotal,
        },
        seeds: {
          active: seedsTotal,
          earned: earnedSeedTotal,
          total:  seedsTotal.plus(earnedSeedTotal),
        },
        roots: {
          total: rootsTotal,
        }
      }));
    }
  }, [
    dispatch,
    beanstalk,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[beanstalk/silo/useBeanstalkSilo] CLEAR');
    dispatch(resetBeanstalkSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const BeanstalkSiloUpdater = () => {
  const [fetch, clear] = useBeanstalkSilo();

  useEffect(() => {
    clear();
    fetch();
  }, [clear, fetch]);

  return null;
};

export default BeanstalkSiloUpdater;

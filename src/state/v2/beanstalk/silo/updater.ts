import { useCallback, useEffect } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from 'util/LedgerUtilities';
import { tokenResult } from 'util/TokenUtilities';

import { BEAN, SEEDS, STALK } from 'constants/v2/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';

export const useBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const [beanstalk] = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH');

      const [
        totalStalk,
        totalSeeds,
        totalRoots,
        totalEarnedBeans,
        totalWithdrawnBeans,
      ] = await Promise.all([
        beanstalk.totalStalk().then(tokenResult(STALK)),
        beanstalk.totalSeeds().then(tokenResult(SEEDS)),
        beanstalk.totalRoots().then(bigNumberResult),
        beanstalk.totalFarmableBeans().then(tokenResult(BEAN)),   // internally, earned == farmable 
        beanstalk.totalWithdrawnBeans().then(tokenResult(BEAN)),
      ] as const);

      console.debug('[beanstalk/silo/useBeanstalkSilo] RESULT', [totalStalk, totalSeeds]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const earnedStalkBalance = totalEarnedBeans.times(BEAN_TO_STALK);
      const activeStalkBalance = totalStalk.plus(earnedStalkBalance);
      const earnedSeedBalance  = totalEarnedBeans.times(BEAN_TO_SEEDS);
      
      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateBeanstalkSiloAssets({
        beans: {
          earned: totalEarnedBeans,
        },
        stalk: {
          active: activeStalkBalance,
          earned: earnedStalkBalance,
          grown:  totalWithdrawnBeans,
          total:  activeStalkBalance.plus(totalWithdrawnBeans),
        },
        seeds: {
          active: totalSeeds,
          earned: earnedSeedBalance,
          total:  totalSeeds.plus(earnedSeedBalance),
        },
        roots: {
          total: totalRoots,
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

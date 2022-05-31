import { useCallback, useEffect } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK, zeroBN } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult } from 'util/LedgerUtilities';
import { tokenResult } from 'util/TokenUtilities';

import { BEAN, SEEDS, STALK } from 'constants/v2/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import BigNumber from 'bignumber.js';
import { SupportedChainId } from 'constants/chains';
import { resetBeanstalkSilo, updateBeanstalkSiloAssets } from './actions';
import { BeanstalkSiloAssets } from '.';

export const useBeanstalkSilo = () => {
  const dispatch = useDispatch();
  const [beanstalk, chainId] = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      console.debug('[beanstalk/silo/useBeanstalkSilo] FETCH');

      // If we're on MAINNET, return the value plus whatever
      // necessary delta (to subtract data, pass a negative value
      // to fixExplit). Otherwise return the original value.
      const fixExploit = (v: BigNumber) => (
        (result: BigNumber) => {
          if (chainId === SupportedChainId.MAINNET) {
            return result.plus(v);
          }
          return v;
        }
      );

      const [
        stalkTotal,
        seedsTotal,
        rootsTotal,
        earnedBeansTotal,
        // withdrawnBeansTotal,
      ] = await Promise.all([
        beanstalk.totalStalk().then(tokenResult(STALK)).then(fixExploit(new BigNumber(-847_198_363.98969))),
        beanstalk.totalSeeds().then(tokenResult(SEEDS)).then(fixExploit(new BigNumber(-3_330_860_480.776205))),
        beanstalk.totalRoots().then(bigNumberResult).then(fixExploit(new BigNumber(-386_865_631_100_312_795_430_494_480_222))),
        beanstalk.totalFarmableBeans().then(tokenResult(BEAN)),   // internally, earned == farmable 
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
        },
        stalk: {
          active: activeStalkTotal,
          earned: earnedStalkTotal,
          grown:  zeroBN,
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
    chainId,  
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

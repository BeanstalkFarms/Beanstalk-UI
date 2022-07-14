import { useCallback, useEffect } from 'react';
import { BEAN_TO_SEEDS, BEAN_TO_STALK } from 'constants/index';
import { useDispatch } from 'react-redux';
import { useAccount } from 'wagmi';

import { BEAN, SEEDS, STALK } from 'constants/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import useChainId from 'hooks/useChain';
import { getAccount, bigNumberResult, tokenResult } from 'util/index';
import useMigrateCall from 'hooks/useMigrateCall';
import { Beanstalk, BeanstalkReplanted } from 'generated/index';
import { resetFarmerSilo, updateFarmerSiloRewards } from './actions';

export const useFarmerSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();
  const migrate = useMigrateCall();

  // Handlers
  const fetch = useCallback(async (_account: string) => {
    const account = getAccount(_account);
    if (beanstalk && account) {
      console.debug('[farmer/silo/useFarmerSilo] FETCH');
      const [
        stalkBalance,
        seedBalance,
        rootBalance,
        earnedBeanBalance,
        grownStalkBalance,
      ] = await Promise.all([
        // balanceOfStalk = stalk + farmableStalk (aka earnedStalk)
        beanstalk.balanceOfStalk(account).then(tokenResult(STALK)),
        beanstalk.balanceOfSeeds(account).then(tokenResult(SEEDS)),
        beanstalk.balanceOfRoots(account).then(bigNumberResult),
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => b.balanceOfFarmableBeans(account),
          (b) => b.balanceOfEarnedBeans(account),
        ]).then(tokenResult(BEAN)),
        beanstalk.balanceOfGrownStalk(account).then(tokenResult(STALK)),
      ] as const);

      console.debug('[farmer/silo/useFarmerSilo] RESULT', [stalkBalance, seedBalance, earnedBeanBalance]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const activeStalkBalance = stalkBalance;
      const earnedStalkBalance = earnedBeanBalance.times(BEAN_TO_STALK);
      const earnedSeedBalance  = earnedBeanBalance.times(BEAN_TO_SEEDS);
      
      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateFarmerSiloRewards({
        beans: {
          earned: earnedBeanBalance,
        },
        stalk: {
          active: activeStalkBalance,
          earned: earnedStalkBalance,
          grown:  grownStalkBalance,
          total:  activeStalkBalance.plus(grownStalkBalance),
        },
        seeds: {
          active: seedBalance,
          earned: earnedSeedBalance,
          total:  seedBalance.plus(earnedSeedBalance),
        },
        roots: {
          total: rootBalance,
        }
      }));
    }
  }, [
    dispatch,
    migrate,
    beanstalk,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/silo/useFarmerSilo] CLEAR');
    dispatch(resetFarmerSilo());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerSiloUpdater = () => {
  const [fetch, clear] = useFarmerSilo();
  const { data: account } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    clear();
    if (account?.address) {
      fetch(account.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address, chainId]);

  return null;
};

export default FarmerSiloUpdater;

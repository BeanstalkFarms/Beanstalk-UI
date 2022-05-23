import { useCallback, useEffect } from 'react';
import { Bean, BEAN_TO_SEEDS, BEAN_TO_STALK } from 'constants/index';
import { useDispatch } from 'react-redux';
import { bigNumberResult, tokenResult } from 'util/LedgerUtilities2';
import { useAccount, useConnect, useNetwork, useProvider } from 'wagmi';

import { Seeds, Stalk } from 'constants/v2/tokens';
import { GetAccountResult } from '@wagmi/core';
import { useBeanstalkContract } from 'hooks/useContract';
import { reset, updateFarmerSiloAssets } from './actions';

export const useFarmerSilo = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async (account: GetAccountResult) => {
    console.debug('[farmer/silo/updater] fetch called', beanstalk, account);

    // FIXME: account?.connector ensures we don't make any calls
    // until the user's wallet is fully connected; alternatively can
    // get status straight from useConnect() above
    if (beanstalk && account?.address && account?.connector?.getChainId()) {
      console.debug('[farmer/silo/updater] fetch executing');
      const [
        stalkBalance,
        seedBalance,
        rootBalance,
        earnedBeanBalance,
        grownStalkBalance,
      ] = await Promise.all([
        beanstalk.balanceOfStalk(account.address).then(tokenResult(Stalk)),
        beanstalk.balanceOfSeeds(account.address).then(tokenResult(Seeds)),
        beanstalk.balanceOfRoots(account.address).then(bigNumberResult),
        beanstalk.balanceOfFarmableBeans(account.address).then(tokenResult(Bean)),
        beanstalk.balanceOfGrownStalk(account.address).then(tokenResult(Stalk)),
      ] as const);

      console.debug('[farmer/silo] fetch result', [stalkBalance, seedBalance]);

      // farmableStalk and farmableSeed are derived from farmableBeans
      // because 1 bean = 1 stalk, 2 seeds
      const earnedStalkBalance = earnedBeanBalance.times(BEAN_TO_STALK);
      const activeStalkBalance = stalkBalance.plus(earnedStalkBalance);
      const earnedSeedBalance  = earnedBeanBalance.times(BEAN_TO_SEEDS);
      
      // total:   active & inactive
      // active:  owned, actively earning other silo assets
      // earned:  active but not yet deposited into a Season
      // grown:   inactive
      dispatch(updateFarmerSiloAssets({
        beans: {
          earned: earnedBeanBalance,
        },
        stalk: {
          total:  activeStalkBalance.plus(grownStalkBalance),
          active: activeStalkBalance,
          earned: earnedStalkBalance,
          grown:  grownStalkBalance,
        },
        seeds: {
          total:  seedBalance.plus(earnedSeedBalance),
          active: seedBalance,
          earned: earnedSeedBalance,
        },
        roots: {
          total: rootBalance,
        }
      }));
    }
  }, [
    dispatch,
    beanstalk,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/silo/updater] clear');
    dispatch(reset());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const FarmerSiloUpdater = () => {
  const [fetch, clear] = useFarmerSilo();
  const { status: connectStatus } = useConnect();
  const { data: account } = useAccount();

  // Fetch on initial connect
  useEffect(() => {
    console.debug('[farmer/silo/updater] status', connectStatus, account);
    if (connectStatus === 'connected' && account) {
      fetch(account);
    } else if (connectStatus === 'disconnected') {
      clear();
    }
  }, [
    connectStatus,
    account,
    fetch,
    clear
  ]);

  return null;
};

export default FarmerSiloUpdater;

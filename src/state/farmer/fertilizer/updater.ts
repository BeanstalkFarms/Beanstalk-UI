import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract, useBeanstalkFertilizerContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import { REPLANT_INITIAL_ID } from 'hooks/useHumidity';
import { bigNumberResult } from 'util/Ledger';
import useChainId from 'hooks/useChain';
import { getAccount } from 'util/Account';
import useMigrateCall from 'hooks/useMigrateCall';
import { ZERO_BN } from 'constants/index';
import { resetFertilizer, updateFertilizer } from './actions';
import { Beanstalk, BeanstalkReplanted } from 'generated';

export const useFetchFarmerFertilizer = () => {
  const dispatch = useDispatch();
  const replantId = useChainConstant(REPLANT_INITIAL_ID);
  const [fertContract] = useBeanstalkFertilizerContract();
  const beanstalk = useBeanstalkContract()
  const migrate = useMigrateCall();

  // Handlers
  const fetch = useCallback(async (_account: string) => {
    const account = getAccount(_account);
    if (fertContract && account) {
      console.debug('[farmer/fertilizer/updater] FETCH: ', replantId.toString());
      const [
        balance,
      ] = await Promise.all([
        fertContract.balanceOf(account, replantId.toString()).then(bigNumberResult).catch(() => ZERO_BN),
        migrate<Beanstalk, BeanstalkReplanted>(beanstalk, [
          (b) => Promise.resolve(ZERO_BN),
          (b) => Promise.resolve(ZERO_BN),
        ])
      ] as const);
      console.debug(`[farmer/fertilizer/updater] RESULT: balance = ${balance.toFixed(10)}`);
      if (balance.gt(0)) {
        dispatch(updateFertilizer({
          [replantId.toNumber()]: balance
        }));
      }
    }
  }, [
    dispatch,
    migrate,
    fertContract,
    replantId
  ]); 
  const clear = useCallback(() => { 
    dispatch(resetFertilizer());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const FarmerFertilizerUpdater = () => {
  const [fetch, clear] = useFetchFarmerFertilizer();
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

export default FarmerFertilizerUpdater;

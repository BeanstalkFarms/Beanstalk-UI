import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkFertilizerContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import { REPLANT_SEASON } from 'hooks/useHumidity';
import { bigNumberResult } from 'util/LedgerUtilities';
import useChainId from 'hooks/useChain';
import { resetFertilizer, updateFertilizer } from './actions';

export const useFetchFarmerFertilizer = () => {
  const dispatch = useDispatch();
  const replantSeason = useChainConstant(REPLANT_SEASON);
  const [fertContract] = useBeanstalkFertilizerContract();

  // Handlers
  const fetch = useCallback(async (account: string) => {
    if (fertContract && account) {
      console.debug('[beanstalk/fertilizer/updater] fetching...');
      const [
        balance,
      ] = await Promise.all([
        fertContract.balanceOf(account, replantSeason.toString()).then(bigNumberResult),
      ] as const);
      console.debug(`[farmer/fertilizer/updater] balance = ${balance.toFixed(10)}`);
      if (balance.gt(0)) {
        dispatch(updateFertilizer({
          [replantSeason.toNumber()]: balance
        }));
      }
    }
  }, [
    dispatch,
    fertContract,
    replantSeason
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

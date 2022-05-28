import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkFertilizerContract } from 'hooks/useContract';
import { useAccount } from 'wagmi';
import { REPLANT_SEASON } from 'hooks/useHumidity';
import { bigNumberResult } from 'util/LedgerUtilities';
import { updateFertTokens } from './actions';

export const useFarmerFertilizer = () => {
  const dispatch = useDispatch();
  const { data: account } = useAccount();
  const fertContract = useBeanstalkFertilizerContract();
  const replantSeason = useChainConstant(REPLANT_SEASON);

  // Handlers
  const fetch = useCallback(async () => {
    if (fertContract && account?.address) {
      console.debug('[beanstalk/fertilizer/updater] fetching...');
      const [
        balance,
      ] = await Promise.all([
        fertContract.balanceOf(account.address, replantSeason.toString()).then(bigNumberResult),
      ] as const);
      console.debug(`[farmer/fertilizer/updater] balance = ${balance.toFixed(10)}`);
      if (balance.gt(0)) {
        dispatch(updateFertTokens({
          [replantSeason.toNumber()]: balance
        }));
      }
    }
  }, [
    dispatch,
    fertContract,
    account,
    replantSeason
  ]); 
  const clear = useCallback(() => {}, []);

  return [fetch, clear] as const;
};

const FarmerFertilizerUpdater = () => {
  const [fetch] = useFarmerFertilizer();
  useEffect(() => {
    console.debug('[farmer/fertilizer/updater] call: fetch()');
    fetch();
  }, [fetch]);
  return null;
};

export default FarmerFertilizerUpdater;

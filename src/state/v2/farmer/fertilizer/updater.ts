import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BARNRAISE_CUSTODIAN_ADDRESSES, USDC_ADDRESSES } from 'constants/v2/addresses';
import { BEAN, USDC } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkFertilizerContract, useERC20Contract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { useAccount } from 'wagmi';
import { BigNumber } from 'ethers';
import { REPLANT_SEASON } from 'hooks/useHumidity';
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
        fertContract.balanceOf(account.address, replantSeason.toString()).then(tokenResult(BEAN)),
      ] as const);
      console.debug(`[farmer/fertilizer/updater] balance = ${balance.toFixed(2)}`);
      dispatch(updateFertTokens({
        [replantSeason.toNumber()]: balance
      }));
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

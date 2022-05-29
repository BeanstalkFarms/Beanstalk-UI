import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BARNRAISE_CUSTODIAN_ADDRESSES, USDC_ADDRESSES } from 'constants/v2/addresses';
import { BEAN, USDC } from 'constants/v2/tokens';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkFertilizerContract, useERC20Contract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import { setRemaining, setTotalRaised } from './actions';

export const useFertilizer = () => {
  const dispatch = useDispatch();
  const fertContract = useBeanstalkFertilizerContract();
  const usdcContract = useERC20Contract(USDC_ADDRESSES);
  const custodian = useChainConstant(BARNRAISE_CUSTODIAN_ADDRESSES);

  // Handlers
  const fetch = useCallback(async () => {
    if (fertContract && usdcContract && custodian) {
      console.debug('[beanstalk/fertilizer/updater] fetching...');
      const [
        remaining,
        totalRaised
      ] = await Promise.all([
        fertContract.remaining().then(tokenResult(BEAN)),
        usdcContract.balanceOf(custodian).then(tokenResult(USDC)),
      ] as const);
      console.debug(`[beanstalk/fertilizer/updater] remaining = ${remaining.toFixed(2)}`);
      dispatch(setRemaining(remaining));
      dispatch(setTotalRaised(totalRaised));
    }
  }, [
    dispatch,
    fertContract,
    usdcContract,
    custodian
  ]); 
  const clear = useCallback(() => {}, []);

  return [fetch, clear] as const;
};

const FertilizerUpdater = () => {
  const [fetch] = useFertilizer();

  useEffect(() => {
    console.debug('[beanstalk/fertilizer/updater] call: fetch()');
    fetch();
  }, [fetch]);

  return null;
};

export default FertilizerUpdater;

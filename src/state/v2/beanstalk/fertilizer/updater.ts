import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BARNRAISE_CUSTODIAN_ADDRESSES, USDC_ADDRESSES } from 'constants/addresses';
import { BEAN, USDC } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkFertilizerContract, useERC20Contract } from 'hooks/useContract';
import { tokenResult } from 'util/TokenUtilities';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { resetFertilizer, setRemaining, setTotalRaised } from './actions';

export const useFertilizer = () => {
  const dispatch = useDispatch();
  const [fertContract] = useBeanstalkFertilizerContract();
  const [usdcContract] = useERC20Contract(USDC_ADDRESSES);
  const custodian = useChainConstant(BARNRAISE_CUSTODIAN_ADDRESSES);

  // Handlers
  const fetch = useCallback(async () => {
    if (fertContract && usdcContract && custodian) {
      console.debug('[beanstalk/fertilizer/updater] FETCH');
      const [
        remaining,
        totalRaised
      ] = await Promise.all([
        fertContract.remaining().then(tokenResult(BEAN)),
        usdcContract.balanceOf(custodian).then(tokenResult(USDC)),
      ] as const);
      console.debug(`[beanstalk/fertilizer/updater] RESULT: remaining = ${remaining.toFixed(2)}`);
      dispatch(setRemaining(remaining));
      dispatch(setTotalRaised(totalRaised));
    }
  }, [
    dispatch,
    fertContract,
    usdcContract,
    custodian
  ]); 
  const clear = useCallback(() => {
    dispatch(resetFertilizer());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const FertilizerUpdater = () => {
  const [fetch, clear] = useFertilizer();
  const chainId = useChainId();
  
  useEffect(() => {
    clear();
    if (chainId === SupportedChainId.ROPSTEN) {
      fetch();
    } else {
      console.warn('[beanstalk/fertilizer/updater] The Fertilizer contract is only supported on Ropsten currently.');
    }
    // NOTE: 
    // The below requires that useChainId() is called last in the stack of hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return null;
};

export default FertilizerUpdater;

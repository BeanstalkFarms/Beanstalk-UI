import { BEAN } from 'constants/v2/tokens';
import { useBeanstalkFertilizerContract } from 'hooks/useContract';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tokenResult } from 'util/LedgerUtilities2';
import { useNetwork } from 'wagmi';
import { setRemaining } from './actions';

export const useFertilizer = () => {
  const dispatch = useDispatch();
  const fertilizer = useBeanstalkFertilizerContract();

  // Handlers
  const fetch = useCallback(async () => {
    if (fertilizer) {
      const [
        remaining
      ] = await Promise.all([
        fertilizer.remaining().then(tokenResult(BEAN)),
      ] as const);
      console.debug(`[beanstalk/fertilizer/updater] remaining = ${remaining.toFixed(2)}`);
      dispatch(setRemaining(remaining));
    }
  }, [
    dispatch,
    fertilizer
  ]);
  const clear = useCallback(() => {}, []);

  return [fetch, clear] as const;
};

const FertilizerUpdater = () => {
  const { activeChain } = useNetwork();
  const [fetch] = useFertilizer();

  useEffect(() => {
    if (activeChain?.id) fetch();
  }, [activeChain?.id, fetch]);

  return null;
};

export default FertilizerUpdater;

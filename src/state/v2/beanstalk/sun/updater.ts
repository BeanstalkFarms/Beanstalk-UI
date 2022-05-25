import { SupportedChainId } from 'constants/chains';
import { BEAN } from 'constants/v2/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { bigNumberResult, tokenResult } from 'util/LedgerUtilities2';
import { useNetwork } from 'wagmi';
import { updateHarvestableIndex } from '../field/actions';
import { setAwaitingSunrise, setRemainingUntilSunrise, updateSeason } from './actions';

export const useSun = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk) {
      const [
        season,
        harvestableIndex,
      ] = await Promise.all([
        beanstalk.season().then(bigNumberResult),
        // FIXME
        beanstalk.harvestableIndex().then(tokenResult(BEAN[SupportedChainId.MAINNET])),
      ] as const);

      console.debug(`[beanstalk/sun/updater] season = ${season}`);
      dispatch(updateSeason(season));
      dispatch(updateHarvestableIndex(harvestableIndex));
    }
  }, [
    dispatch,
    beanstalk
  ]);
  
  const clear = useCallback(() => {
    // console.debug(`[farmer/silo/updater] clear`)
    // dispatch(reset())
  }, []);

  return [fetch, clear] as const;
};

const SunUpdater = () => {
  const { activeChain } = useNetwork();
  const [fetch] = useSun();
  const dispatch = useDispatch();
  const { awaiting, next } = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']>((state) => state._beanstalk.sun.sunrise);

  // Update sunrise timer
  useEffect(() => {
    if (awaiting === false) {
      const i = setInterval(() => {
        const _remaining = next.diffNow();
        dispatch(setRemainingUntilSunrise(_remaining));
        // console.debug(`[beanstalk/sun/updater] remaining until sunrise: ${(_remaining.milliseconds / 1000 / 60).toFixed(2)} minutes`);
        if (_remaining.milliseconds < 0) {
          dispatch(setAwaitingSunrise(_remaining.milliseconds < 0));
        }
      }, 1000);
      return () => clearInterval(i);
    }
  }, [dispatch, awaiting, next]);

  // 
  // useEffect(() => {
    
  // }, [season])

  // Fetch when chain changes
  useEffect(() => {
    if (activeChain?.id) {
      fetch();
    }
  }, [activeChain?.id, fetch]);

  return null;
};

export default SunUpdater;

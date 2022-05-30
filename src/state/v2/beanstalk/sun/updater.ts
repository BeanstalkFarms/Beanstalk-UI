import { SupportedChainId } from 'constants/chains';
import { BEAN } from 'constants/v2/tokens';
import { useBeanstalkContract } from 'hooks/useContract';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { bigNumberResult } from 'util/LedgerUtilities';
import { tokenResult } from 'util/TokenUtilities';
import { updateHarvestableIndex } from '../field/actions';
import { resetSun, setAwaitingSunrise, updateSeason } from './actions';

export const useSun = () => {
  const dispatch = useDispatch();
  const [beanstalk, chainId] = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    try {
      if (beanstalk) {
        console.debug(`[beanstalk/sun/useSun] FETCH (contract = ${beanstalk.address}, chainId = ${chainId})`);
        const [
          season,
          harvestableIndex,
        ] = await Promise.all([
          beanstalk.season().then(bigNumberResult),
          beanstalk.harvestableIndex().then(tokenResult(BEAN[SupportedChainId.MAINNET])), // FIXME
        ] as const);

        console.debug(`[beanstalk/sun/useSun] RESULT: season = ${season}`);
        dispatch(updateSeason(season));
        dispatch(updateHarvestableIndex(harvestableIndex));
      }
    } catch (e) {
      console.debug('[beanstalk/sun/useSun] FAILED', e);
      console.error(e);
    }
  }, [
    dispatch,
    beanstalk,
    chainId
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/silo/useSun] clear');
    dispatch(resetSun());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const SunUpdater = () => {
  const [fetch, clear] = useSun();
  const dispatch = useDispatch();
  const { season, sunrise } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const { awaiting, next } = sunrise;

  // Update sunrise timer
  useEffect(() => {
    if (awaiting === false) {
      const i = setInterval(() => {
        const _remaining = next.diffNow();
        // dispatch(setRemainingUntilSunrise(_remaining));
        // console.debug(`[beanstalk/sun/updater] remaining until sunrise: ${(_remaining.milliseconds / 1000 / 60).toFixed(2)} minutes`);
        if (_remaining.milliseconds < 0 && awaiting === false) {
          dispatch(setAwaitingSunrise(_remaining.milliseconds < 0));
        }
      }, 1000);
      return () => clearInterval(i);
    }
  }, [dispatch, awaiting, next]);

  // When the season changes
  useEffect(() => {
    if (awaiting) {
      console.debug('[beanstalk/sun/updater] caught new season = ', season?.toNumber());
      dispatch(setAwaitingSunrise(false));
    }
  }, [dispatch, awaiting, season]);

  // Fetch when chain changes
  useEffect(() => {
    clear();
    fetch();
  }, [
    fetch,
    clear
  ]);

  return null;
};

export default SunUpdater;

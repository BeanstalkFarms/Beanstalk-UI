import { DateTime } from 'luxon';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBeanstalkContract } from '~/hooks/useContract';
import useSeason from '~/hooks/useSeason';
import useTimedRefresh from '~/hooks/useTimedRefresh';
import { AppState } from '~/state';
import { bigNumberResult } from '~/util/Ledger';
import { getNextExpectedSunrise } from '.';
import {
  resetSun,
  setAwaitingSunrise,
  setNextSunrise,
  setRemainingUntilSunrise,
  updateSeason,
  updateSeasonTime
} from './actions';

export const useSun = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();

  // Handlers
  const fetch = useCallback(async () => {
    try {
      if (beanstalk) {
        console.debug(`[beanstalk/sun/useSun] FETCH (contract = ${beanstalk.address})`);
        const [
          season
        ] = await Promise.all([
          beanstalk.season().then(bigNumberResult),
        ] as const);
        console.debug(`[beanstalk/sun/useSun] RESULT: season = ${season}`);
        dispatch(updateSeason(season));

        const [
          seasonTime
        ] = await Promise.all([
          beanstalk.seasonTime().then(bigNumberResult),
        ] as const);
        console.debug(`[beanstalk/sun/useSun] RESULT: seasonTime = ${seasonTime}`);
        dispatch(updateSeasonTime(seasonTime));
      }
    } catch (e) {
      console.debug('[beanstalk/sun/useSun] FAILED', e);
      console.error(e);
    }
  }, [
    dispatch,
    beanstalk,
  ]);
  
  const clear = useCallback(() => {
    console.debug('[farmer/silo/useSun] clear');
    dispatch(resetSun());
  }, [dispatch]);

  return [fetch, clear] as const;
};

const SunUpdater = () => {
  const [fetch, clear] = useSun();
  const dispatch  = useDispatch();
  const season    = useSeason();
  const next      = useSelector<AppState, DateTime>((state) => state._beanstalk.sun.sunrise.next);
  const awaiting  = useSelector<AppState, boolean>((state) => state._beanstalk.sun.sunrise.awaiting);

  // Update sunrise timer
  useEffect(() => {
    if (awaiting === false) {
      const i = setInterval(() => {
        const _remaining = next.diffNow();
        if (_remaining.as('seconds') <= 0 && awaiting === false) {
          dispatch(setAwaitingSunrise(true));
        } else {
          dispatch(setRemainingUntilSunrise(_remaining));
        }
      }, 1000);
      return () => clearInterval(i);
    }
  }, [dispatch, awaiting, next]);

  useTimedRefresh(fetch, 2500, awaiting === true);

  // Fetch when chain changes
  useEffect(() => {
    clear();
    fetch();
  }, [
    fetch,
    clear
  ]);
  
  /// For each new season...
  useEffect(() => {
    dispatch(setAwaitingSunrise(false));
    dispatch(setNextSunrise(getNextExpectedSunrise(true)));
    // toast
  }, [dispatch, season]);

  return null;
};

export default SunUpdater;

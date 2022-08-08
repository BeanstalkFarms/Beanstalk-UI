import { DateTime, Duration } from 'luxon';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import toast from 'react-hot-toast';
import { useBeanstalkContract } from '~/hooks/useContract';
import useSeason from '~/hooks/useSeason';
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
          season, seasonTime
        ] = await Promise.all([
          beanstalk.season().then(bigNumberResult),
          beanstalk.seasonTime().then(bigNumberResult),
        ] as const);
        console.debug(`[beanstalk/sun/useSun] RESULT: season = ${season}`);
        console.debug(`[beanstalk/sun/useSun] RESULT: seasonTime = ${seasonTime}`);
        dispatch(updateSeason(season));
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
  const seasonTime  = useSelector<AppState, BigNumber>((state) => state._beanstalk.sun.seasonTime);
  const remaining  = useSelector<AppState, Duration>((state) => state._beanstalk.sun.sunrise.remaining);

  // Update sunrise timer
  useEffect(() => {
    if (awaiting === false) {
      const i = setInterval(() => {
        const _remaining = next.diffNow();
        if (_remaining.as('seconds') <= 0) {
          dispatch(setAwaitingSunrise(true));
        } else {
          dispatch(setRemainingUntilSunrise(_remaining));
        }
      }, 1000);
      return () => clearInterval(i);
    } 
    const i = setInterval(() => {
      fetch();
    }, 3000);
    return () => clearInterval(i);
  }, [dispatch, awaiting, next, fetch]);
  
  useEffect(() => {
    if (season.eq(seasonTime) && season.gt(-1)) {
      dispatch(setAwaitingSunrise(false));
      if (remaining.as('seconds') === 0) {
        toast.success(`The Sun has risen. It is now Season ${season.toString()}.`);
      }
      dispatch(setRemainingUntilSunrise(getNextExpectedSunrise().diffNow()));
    }
  }, [dispatch, remaining, season, seasonTime]);

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

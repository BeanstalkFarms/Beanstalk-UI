import { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { DateTime, Duration } from 'luxon';

const getNextHour = () => DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }).plus({ hour: 1 });

const useSunriseTimer = () => {
  const season = useSelector<AppState, AppState['_beanstalk']['sun']['season']>((state) => state._beanstalk.sun.season);

  /** Whether the timer has ticked down to zero. */
  const [awaitingSunrise, setAwaitingSunrise] = useState<boolean>(false);
  /** Timestamp of next Sunrise, in ms. */
  const [nextSunrise, setNextSunrise] = useState<DateTime>(getNextHour());
  /** Time array */
  const [remaining, setRemaining] = useState<Duration>(nextSunrise.diffNow());

  // When data is available, calculate the next Bonus decrease.
  useEffect(() => {
    if (season) {
      console.debug(season);
    }
  }, [season]);

  // When next decrease is available, set up a timer
  // counting down every 1s.
  useEffect(() => {
    if (awaitingSunrise === false) {
      const i = setInterval(() => {
        const _remaining = nextSunrise.diffNow();
        setRemaining(_remaining);
        setAwaitingSunrise(_remaining.milliseconds < 0);
      }, 1000);
      return () => clearInterval(i);
    }
  }, [awaitingSunrise, nextSunrise]);

  return [nextSunrise, remaining, awaitingSunrise];
};

export default useSunriseTimer;

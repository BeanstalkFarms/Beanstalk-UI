import BigNumber from 'bignumber.js';
import { DateTime, Duration } from 'luxon';

export type Sun = {
  season: BigNumber;
  sunrise: {
    /** Whether we're waiting for the sunrise() function to be called. */
    awaiting: boolean;
    /** The DateTime of the next expected Sunrise */
    next: DateTime;
    /** The Duration remaining until the next Sunrise. Updated once per second. */
    remaining: Duration;
  }
}

// const UNPAUSE_DATE = DateTime.fromISO('2022-07-04T09:00:00.000-07:00'); // '2016-05-25T09:08:34.123+06:00'
export const getNextExpectedSunrise = (real: boolean = false) => {
  const now = DateTime.now();
  if (real) return now.set({ minute: 0, second: 0, millisecond: 0 }).plus({ hour: 1 });
  return now.plus({ seconds: 10 });
};

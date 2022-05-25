import BigNumber from 'bignumber.js';
import { DateTime, Duration } from 'luxon';

export type Sun = {
  season: BigNumber;
  sunrise: {
    awaiting: boolean;
    next: DateTime;
    remaining: Duration;
  }
}

export const getNextHour = () => DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }).plus({ hour: 1 });

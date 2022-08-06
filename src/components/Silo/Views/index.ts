import BigNumber from 'bignumber.js';
import { DataPoint } from '~/components/Common/Charts/LineChart';

export type TabData = {
  season: BigNumber;
  current: BigNumber[];
  series: DataPoint[][];
};

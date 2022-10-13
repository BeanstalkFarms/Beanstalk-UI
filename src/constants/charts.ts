import { TokenMap } from '~/constants/index';

type DataPoint = {
  season: number;
  value: number;
  date?: Date;
  tokens?: TokenMap<number>
};

export default DataPoint;

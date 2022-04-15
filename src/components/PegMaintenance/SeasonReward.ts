import BigNumber from 'bignumber.js';
import { seasonStrings } from 'components/Common';
import { displayFullBN } from 'util/index';

export default function SeasonReward(time: number) {
  if (time > 0) return [null];
  const title = 'Season Reward';
  const description = seasonStrings.reward;
  const beans = 100 * 1.01 ** Math.min(-time, 300);
  return [
    title,
    beans.toFixed(),
    description,
    `${displayFullBN(new BigNumber(beans))} Beans`,
  ];
}

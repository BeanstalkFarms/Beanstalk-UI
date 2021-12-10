import BigNumber from 'bignumber.js';
import { seasonStrings } from 'components/Common';
import { displayFullBN } from 'util/index';

export default function SeasonReward(t) {
  const display = (time) => {
    const title = 'Season Reward';
    const description = seasonStrings.reward;
    const beans = 100 * 1.01 ** Math.min(-time, 300);
    return [
      title,
      beans.toFixed(),
      description,
      `${displayFullBN(new BigNumber(beans))} Beans`,
    ];
  };
  if (t > 0) return [null];

  return display(t);
}

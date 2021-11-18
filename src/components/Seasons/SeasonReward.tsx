import React from 'react';
import BigNumber from 'bignumber.js';
import { HeaderLabelWithTimer } from 'components/Common';
import { displayFullBN } from 'util/index';

export default function SeasonReward(props) {
  const display = (time) => {
    const title = 'Season Reward';
    const description =
      'Beans Rewarded for Calling the Sunrise Function Right Now';
    const beans = 100 * 1.01 ** Math.min(-time, 300);
    return [
      title,
      beans.toFixed(),
      description,
      `${displayFullBN(new BigNumber(beans))} Beans`,
    ];
  };

  return <HeaderLabelWithTimer display={display} time={props.time} />;
}

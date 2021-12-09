import BigNumber from 'bignumber.js';
import { useEffect, useState, useRef } from 'react';
import { seasonStrings } from 'components/Common';
import { displayFullBN } from 'util/index';

export default function SeasonReward(ns) {
  const timeUntilSunrise = (deadline) =>
    parseInt(deadline, 10) - Date.now() / 1e3;

  const timer = useRef();
  const [time, setTime] = useState(timeUntilSunrise(ns));

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setTime(timeUntilSunrise(ns));
    }, 1000);
    return () => {
      window.clearInterval(timer.current);
    };
  }, [time, ns]);

  const display = (_time) => {
    const title = 'Season Reward';
    const description = seasonStrings.reward;
    const beans = 100 * 1.01 ** Math.min(-_time, 300);
    return [
      title,
      beans.toFixed(),
      description,
      `${displayFullBN(new BigNumber(beans))} Beans`,
    ];
  };
  if (parseInt(display(time)[1], 10) < 1) return [null]; // if returns a small value reset to null so it wont show up

  return display(time);
}

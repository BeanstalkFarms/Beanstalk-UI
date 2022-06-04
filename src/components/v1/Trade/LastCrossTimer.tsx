import { useEffect, useState, useRef } from 'react';
import { tradeStrings } from 'components/Common';
import { timeToString, timeToStringDetailed } from 'util/index';

export default function LastCrossTimer(lc) {
  const timeSinceCross = () => {
    if (lc === 0) return 0;
    return Date.now() / 1e3 - lc;
  };

  const timer = useRef();
  const [time, setTime] = useState(timeSinceCross());

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setTime(timeSinceCross());
    }, 1000);
    return () => {
      window.clearInterval(timer.current);
    };
    // eslint-disable-next-line
  }, [time, lc]);

  const display = (_time) => [
    'Time Since $1 Crossed',
    _time === 0 ? '-' : timeToString(_time),
    tradeStrings.timeSinceCross,
    _time === 0 ? '-' : timeToStringDetailed(_time),
  ];

  return display(time);
}

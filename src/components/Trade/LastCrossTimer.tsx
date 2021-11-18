import React, { useEffect, useState, useRef } from 'react';
import { HeaderLabelWithTimer } from 'components/Common';
import { timeToString, timeToStringDetailed } from 'util/index';

export default function LastCrossTimer(props) {
  const timeSinceCross = () => {
    if (props.lastCross === 0) return 0;
    return Date.now() / 1e3 - props.lastCross;
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
  }, [time, props.lastCross]);

  const display = (_time) => [
    'Time Since $1 Crossed',
    _time === 0 ? '-' : timeToString(_time),
    'This is the time elapsed since the price last crossed the peg.',
    _time === 0 ? '-' : timeToStringDetailed(_time),
  ];

  return <HeaderLabelWithTimer display={display} time={time} />;
}

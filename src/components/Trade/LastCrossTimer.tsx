import React, { useEffect, useState, useRef } from 'react';
import { HeaderLabelWithTimer } from '../Common';
import { timeToString } from '../../util';

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

  const display = (t) => [
    'Time Since $1 Crossed',
    t === 0 ? '-' : timeToString(t),
    'This is the time elapsed since the TWAP last crossed the peg.',
  ];

  return <HeaderLabelWithTimer display={display} time={time} />;
}

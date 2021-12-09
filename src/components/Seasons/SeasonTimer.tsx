import { useEffect, useState, useRef } from 'react';
import { seasonStrings } from 'components/Common';
import { timeToString, timeToStringDetailed } from 'util/index';

export default function SeasonTimer(ns) {
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
    let timeDifference;
    let title;
    let description;
    if (_time <= 0) {
      timeDifference = -_time;
      title = 'Sunrise Overdue By';
      description = seasonStrings.sunriseOverdue;
    } else {
      timeDifference = _time;
      title = 'Next Sunrise';
      description = seasonStrings.nextSunrise;
    }

    return [
      title,
      timeToString(timeDifference),
      description,
      timeToStringDetailed(timeDifference),
    ];
  };

  return display(time);
}

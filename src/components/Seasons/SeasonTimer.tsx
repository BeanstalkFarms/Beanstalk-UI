import React from 'react';
import { HeaderLabelWithTimer } from '../Common';
import { timeToString } from '../../util';

export default function SeasonTimer(props) {
  const display = (time) => {
    let timeDifference;
    let title;
    let description;
    if (time <= 0) {
      timeDifference = -time;
      title = 'Sunrise Overdue By';
      description =
        'This is the time elapsed since the Sunrise function could be called.';
    } else {
      timeDifference = time;
      title = 'Next Sunrise';
      description =
        'This is the time until the next Sunrise function can be called at the top of the hour.';
    }

    return [title, timeToString(timeDifference), description];
  };

  return <HeaderLabelWithTimer display={display} time={props.time} />;
}

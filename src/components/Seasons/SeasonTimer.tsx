import React from 'react';
import { HeaderLabelWithTimer, seasonStrings } from 'components/Common';
import { timeToString, timeToStringDetailed } from 'util/index';

export default function SeasonTimer(props) {
  const display = (time) => {
    let timeDifference;
    let title;
    let description;
    if (time <= 0) {
      timeDifference = -time;
      title = 'Sunrise Overdue By';
      description = seasonStrings.sunriseOverdue;
    } else {
      timeDifference = time;
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

  return <HeaderLabelWithTimer display={display} time={props.time} />;
}

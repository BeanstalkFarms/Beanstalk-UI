import React from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { FormatTooltip } from '../Common';

export default function CircularProgressWithLabel(props) {
  const showBlip =
    props.value - props.lowvalue < 3 && props.value - props.lowvalue > 0;
  const displayLowNumber = showBlip ? 3 : props.value - props.lowvalue;
  const rotation = !showBlip
    ? `rotate(${-90 + (360 * props.lowvalue) / 100}deg)`
    : `rotate(${
        -90 + (360 * (props.lowvalue - displayLowNumber / 2)) / 100
      }deg)`;
  const color = props.voting ? 'green' : 'red';

  const arrow = '\u2192';

  const votingTitle = props.voting
    ? `${props.lowvalue}% ${arrow} ${props.value}%`
    : `${props.value}% ${arrow} ${props.lowvalue}%`;
  // const title = (
  //   props.lowvalue === undefined
  //     ? `${props.value}%`
  //     : props.lowvalue !== props.value
  //       ? votingTitle
  //       : `${props.value}%`
  // )

  const title =
    props.lowvalue !== undefined && props.lowvalue !== props.value
      ? votingTitle
      : `${props.value}%`;

  const circles = [];
  if (props.lowvalue !== undefined) {
    circles.push(
      <CircularProgress
        key="blackground"
        size={38}
        style={{ position: 'absolute', left: '1.2px', top: '1.2px' }}
        thickness={0.5}
        variant="determinate"
        value={100}
      />,
    );
    circles.push(
      <CircularProgress
        key="change"
        style={{ position: 'absolute', color: color, transform: rotation }}
        value={displayLowNumber}
        variant="determinate"
      />,
    );
    circles.push(
      <CircularProgress
        key="majoriry"
        style={{ position: 'absolute', transform: 'rotate(87deg)' }}
        thickness={7}
        value={(7 * 100) / 360}
        variant="determinate"
      />,
    );
    circles.push(
      <CircularProgress
        key="superMajority"
        style={{ position: 'absolute', transform: 'rotate(147deg)' }}
        thickness={7}
        value={(7 * 100) / 360}
        variant="determinate"
      />,
    );
  }

  return (
    <FormatTooltip margin="0" title={title}>
      <Box display="inline-flex" position="relative">
        <CircularProgress
          value={props.lowvalue !== undefined ? props.lowvalue : props.value}
          variant="determinate"
        />
        {circles}
        <Box
          alignItems="center"
          bottom={0}
          display="flex"
          justifyContent="center"
          left={0}
          position="absolute"
          right={0}
          top={0}
        >
          <Typography
            color="textSecondary"
            component="div"
            style={{ position: 'absolute' }}
            variant="caption"
          >
            {props.lowvalue === undefined ? `${Math.round(props.value)}%` : ''}
          </Typography>
        </Box>
      </Box>
    </FormatTooltip>
  );
}

CircularProgressWithLabel.defaultProps = {
  voting: false,
};

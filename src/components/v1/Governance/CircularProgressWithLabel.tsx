import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { StyledTooltip } from 'components/Common';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  blackground: {
    position: 'absolute',
    left: '1.2px',
    top: '1.2px'
  },
  majority: {
    position: 'absolute',
    transform: 'rotate(87deg)'
  },
  superMajority: {
    position: 'absolute',
    transform: 'rotate(147deg)'
  },
  absolutePosition: {
    position: 'absolute'
  },
  circularProgress: {
    position: 'absolute',
    color: (props: any) => props.color,
    transform: (props: any) => props.rotation
  }
});

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
  const styleProps = {
    color: color,
    rotation: rotation
  };
  const classes = useStyles(styleProps);
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
        className={classes.blackground}
        thickness={0.5}
        variant="determinate"
        value={100}
      />
    );
    circles.push(
      <CircularProgress
        key="change"
        className={classes.circularProgress}
        value={displayLowNumber}
        variant="determinate"
      />
    );
    circles.push(
      <CircularProgress
        key="majority"
        className={classes.majority}
        thickness={7}
        value={(7 * 100) / 360}
        variant="determinate"
      />
    );
    circles.push(
      <CircularProgress
        key="superMajority"
        className={classes.superMajority}
        thickness={7}
        value={(7 * 100) / 360}
        variant="determinate"
      />
    );
  }

  return (
    <StyledTooltip margin="0" title={title}>
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
            className={classes.absolutePosition}
            variant="caption"
          >
            {props.lowvalue === undefined ? `${Math.round(props.value)}%` : ''}
          </Typography>
        </Box>
      </Box>
    </StyledTooltip>
  );
}

CircularProgressWithLabel.defaultProps = {
  voting: false,
};
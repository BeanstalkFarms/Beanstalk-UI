import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    toggleStyle: {
        position: 'absolute',
        top: '10px',
        right: '25px',
    },
    toggleStyleMobile: {
        position: 'absolute',
        top: '8px',
        right: '10px',
    },
    toggleButtonStyle: {
        padding: '5px',
        minWidth: '42px',
    },
    toggleButtonStyleMobile: {
        padding: '2px',
        minWidth: '32px',
    }
});

export function TimeSelector(props) {
  const classes = useStyles();

  const change = (event, value) => {
    if (value !== null) props.setValue(value);
  };

  return (
    <ToggleButtonGroup
      size={props.size}
      aria-label="contained primary button group"
      color="primary"
      exclusive
      onChange={change}
      className={!props.isMobile ? classes.toggleStyle : classes.toggleStyleMobile}
      value={props.value}
      variant="contained"
    >
      {/* <ToggleButton className={!props.isMobile ? classes.toggleButtonStyle : classes.toggleButtonStyleMobile} value="week">
        {props.isMobile ? 'w' : 'week'}
      </ToggleButton> */}
      <ToggleButton className={!props.isMobile ? classes.toggleButtonStyle : classes.toggleButtonStyleMobile} value="month">
        {props.isMobile ? 'm' : 'month'}
      </ToggleButton>
      <ToggleButton className={!props.isMobile ? classes.toggleButtonStyle : classes.toggleButtonStyleMobile} value="all">
        {props.isMobile ? 'a' : 'all'}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

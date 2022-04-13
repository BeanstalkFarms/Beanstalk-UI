import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';

export function TimeSelector(props) {
  const toggleStyle = !props.isMobile
    ? {
        position: 'absolute',
        top: '10px',
        right: '25px',
      }
    : {
        position: 'absolute',
        top: '8px',
        right: '10px',
      };
  const toggleButtonStyle = !props.isMobile
    ? {
        padding: '5px',
        minWidth: '42px',
      }
    : {
        padding: '2px',
        minWidth: '32px',
      };

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
      style={toggleStyle}
      value={props.value}
      variant="contained"
    >
      <ToggleButton style={toggleButtonStyle} value="week">
        {props.isMobile ? 'w' : 'week'}
      </ToggleButton>
      <ToggleButton style={toggleButtonStyle} value="month">
        {props.isMobile ? 'm' : 'month'}
      </ToggleButton>
      <ToggleButton style={toggleButtonStyle} value="all">
        {props.isMobile ? 'a' : 'all'}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

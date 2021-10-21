import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export function DataSelector(props) {
  const toggleStyle = !props.isMobile ? {
    position: 'absolute',
    top: '10px',
    left: '25px',
  } : {
    position: 'absolute',
    top: '8px',
    left: '10px',
  };
  const toggleButtonStyle = !props.isMobile ? {
    padding: '5px',
    minWidth: '42px',
  } : {
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
      <ToggleButton style={toggleButtonStyle} value="hr">
        {props.isMobile ? 'h' : 'hr'}
      </ToggleButton>
      <ToggleButton style={toggleButtonStyle} value="day">
        {props.isMobile ? 'd' : 'day'}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

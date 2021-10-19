import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export function DataSelector(props) {
  const toggleStyle = {
    position: 'absolute',
    top: '10px',
    left: '25px',
  };
  const toggleButtonStyle = {
    padding: '5px',
    minWidth: '42px',
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
        hr
      </ToggleButton>
      <ToggleButton style={toggleButtonStyle} value="day">
        day
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

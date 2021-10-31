import React, { useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { theme } from '../../constants';

export default function PlotInputField(props) {
  const [displayValue, setDisplayValue] = useState('');

  const classes = makeStyles(() => ({
    inputText: {
      fontSize: 'calc(15px + 1vmin)',
      fontFamily: 'Lucida Console',
      fontWeight: '400',
    },
  }))();

  const smallLabels = {
    fontSize: 'calc(9px + 0.7vmin)',
    fontFamily: 'Futura-PT',
  };
  const leftStyle = {
    display: 'inline-block',
    float: 'left',
    fontFamily: 'Futura-PT-Book',
    marginLeft: '13px',
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
  };
  const maxStyle = {
    backgroundColor: theme.primary,
    borderRadius: '30px',
    color: theme.accentText,
    fontSize: '13px',
    fontFamily: 'Futura-PT-Book',
    height: '25px',
    minWidth: '50px',
  };

  const handleChange = (event) => {
    setDisplayValue(event.target.value);
    props.handleChange(event);
  };

  let endAdornment = props.maxHandler !== undefined ?
    <InputAdornment position="end">
      <Button onClick={props.maxHandler} style={maxStyle}>
        Max
      </Button>
    </InputAdornment>
  : null;

  endAdornment = props.minHandler !== undefined ?
    <InputAdornment position="end">
      <Button onClick={props.minHandler} style={maxStyle}>
        Min
      </Button>
    </InputAdornment>
  : endAdornment;

  if (props.hidden) return null;

  return (
    <Box style={{ margin: '8px 0' }}>
      <Box style={smallLabels}>
        <Box style={leftStyle}>{props.label}</Box>
      </Box>

      <TextField
        className="TextField-rounded"
        placeholder={props.baseInput}
        variant="outlined"
        size="medium"
        type="number"
        disabled={props.handleChange === undefined}
        value={
          props.value.isNegative()
            ? ''
            : (displayValue.length > 1 &&
                displayValue.replaceAll('0', '').length === 0) ||
              (displayValue.indexOf('.') > -1 &&
                displayValue.lastIndexOf('0') === displayValue.length - 1)
            ? displayValue
            : props.value.toFixed()
        }
        onChange={handleChange}
        onWheel={(e) => e.target.blur()}
        onKeyDown={(e) =>
          (e.key === 'e' || e.key === '+' || e.key === '-') &&
          e.preventDefault()
        }
        fullWidth
        InputProps={{
          inputProps: {
            min: 0.0,
            step: 1.0,
            inputMode: 'decimal',
          },
          classes: {
            input: classes.inputText,
          },
          endAdornment,
        }}
      />
    </Box>
  );
}

PlotInputField.defaultProps = {
  action: 'Deposit',
  baseInput: '0',
  hidden: false,
  maxval: 0,
  label: 'Index',
};

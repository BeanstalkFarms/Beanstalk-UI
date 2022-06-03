import React, { useState } from 'react';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { theme } from 'constants/index';
import { QuestionModule } from './index';

const useStyles = makeStyles({
  inputText: {
    fontSize: 'calc(15px + 1vmin)',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
  },
  smallLabels: {
    fontSize: 'calc(9px + 0.7vmin)',
    fontFamily: 'Futura-PT',
  },
  leftStyle: {
    display: 'inline-block',
    float: 'left',
    fontFamily: 'Futura-PT-Book',
    marginLeft: '13px',
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
  },
  maxStyle: {
    backgroundColor: theme.primary,
    borderRadius: '30px',
    color: theme.accentText,
    fontSize: '13px',
    fontFamily: 'Futura-PT-Book',
    height: '25px',
    minWidth: '50px',
  }
});

export default function PlotInputField(props) {
  const classes = useStyles();
  const [displayValue, setDisplayValue] = useState('');

  const handleChange = (event) => {
    setDisplayValue(event.target.value);
    props.handleChange(event);
  };

  let endAdornment =
    props.maxHandler !== undefined ? (
      <InputAdornment position="end">
        <Button onClick={props.maxHandler} className={classes.maxStyle}>
          Max
        </Button>
      </InputAdornment>
    ) : null;

  endAdornment =
    props.minHandler !== undefined ? (
      <InputAdornment position="end">
        <Button onClick={props.minHandler} className={classes.maxStyle}>
          Min
        </Button>
      </InputAdornment>
    ) : (
      endAdornment
    );

  if (props.hidden) return null;

  return (
    <Box sx={{ margin: '8px 0' }}>
      <Box className={classes.smallLabels}>
        <Box className={classes.leftStyle}>
          {props.description
            ? (
              <Box>
                {props.label}
                <QuestionModule
                  description={props.description}
                  margin="-10px 0 0 0"
                  placement="right"
                />
              </Box>
            )
            : props.label
          }
        </Box>
      </Box>

      <TextField
        className="TextField-rounded"
        placeholder={props.baseInput}
        variant="outlined"
        size="medium"
        type="number"
        disabled={props.handleChange === undefined}
        error={props.error}
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
  error: undefined,
};
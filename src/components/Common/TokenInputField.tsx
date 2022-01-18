import React, { useState } from 'react';
import { Box, Button, InputAdornment, Slider, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CryptoAsset, displayBN, displayFullBN, TokenLabel } from 'util/index';
import { theme } from 'constants/index';
import { FormatTooltip, TokenTypeImageModule } from './index';

const useStyles = makeStyles({
  inputText: {
    fontSize: 'calc(15px + 1vmin)',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
    color: theme.text,
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
  rightStyle: {
    display: 'inline-block',
    float: 'right',
    marginRight: '13px',
    textAlign: 'right' as const,
  },
});

const maxStyle = {
  backgroundColor: theme.primary,
  borderRadius: '30px',
  color: theme.accentText,
  fontSize: '13px',
  fontFamily: 'Futura-PT-Book',
  height: '25px',
  minWidth: '50px',
};
const tokenTypeImageStyle = {
  height: '30px',
  marginLeft: '5px',
  width: '20px',
};

export default function TokenInputField(props) {
  const [displayValue, setDisplayValue] = useState('');
  const classes = useStyles();
  const label = props.label || TokenLabel(props.token);

  function maxButton() {
    if (props.maxHandler !== undefined) {
      return (
        <Button onClick={props.maxHandler} style={maxStyle} disabled={props.locked}>
          Max
        </Button>
      );
    }
  }

  const handleChange = (event) => {
    setDisplayValue(event.target.value);
    props.handleChange(event);
  };
  const handleSlider = (event, newEvent) => {
    setDisplayValue(newEvent.toString());
    props.handleSlider(newEvent);
  };

  function displayLP(balance) {
    return `${displayBN(balance[0])} ${TokenLabel(
      CryptoAsset.Bean
    )}/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  let balanceContent = null;
  if (props.balance) {
    balanceContent = props.isLP && props.poolForLPRatio !== undefined
      ? displayLP(props.poolForLPRatio(props.balance))
      : `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`;
  }

  const endAdornment = (
    <InputAdornment position="end">
      {maxButton()}
      <TokenTypeImageModule
        style={tokenTypeImageStyle}
        token={props.token}
      />
    </InputAdornment>
  );
  const startAdornment = props.range ? (
    <InputAdornment position="start">
      <span style={{ fontSize: 'calc(14px + 1vmin)', fontFamily: 'Lucida Console', display: 'flex' }}>
        0&nbsp;-
      </span>
    </InputAdornment>
  ) : null;
  const marks = props.range ? [
    {
      value: 0,
    },
    {
      value: props.balance.multipliedBy(1 / 4),
    },
    {
      value: props.balance.multipliedBy(1 / 2),
    },
    {
      value: props.balance.multipliedBy(3 / 4),
    },
    {
      value: props.balance,
    },
  ] : null;
  const showSlider = props.range ? (
    <Box style={{ padding: '0 10px' }}>
      <Slider
        value={props.value.toNumber()}
        onChange={handleSlider}
        aria-labelledby="input-slider"
        min={0}
        step={10000}
        max={props.balance.toNumber()}
        marks={marks}
      />
    </Box>
  ) : null;

  if (props.hidden) return null;

  return (
    <Box style={{ margin: '8px 0' }}>
      <Box className={classes.smallLabels}>
        <Box className={classes.leftStyle}>{label}</Box>
        {props.balance && !props.range && (
          <FormatTooltip placement="right" title={balanceContent}>
            <Box className={classes.rightStyle}>
              &nbsp;{`Balance: ${displayBN(props.balance)}`}
            </Box>
          </FormatTooltip>
        )}
      </Box>
      {showSlider}

      <TextField
        className="TextField-rounded"
        placeholder={props.placeholder || '0.0000'}
        variant="outlined"
        size="medium"
        type="number"
        disabled={props.handleChange === undefined || props.locked}
        error={props.error}
        value={
          props.value.isNegative()
            ? ''
            : (displayValue.length > 1 &&
                displayValue.replaceAll('0', '').length === 0) ||
              (props.value.toFixed() === '0' && displayValue === '') ||
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
          startAdornment,
        }}
      />
    </Box>
  );
}

TokenInputField.defaultProps = {
  label: null,
  action: 'Deposit',
  hidden: false,
  locked: false,
  maxval: 0,
  token: 'Beans',
  poolForLPRatio: undefined,
};

import React, { useState } from 'react';
import { Box, Button, InputAdornment, Slider, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BigNumber from 'bignumber.js';

import { CryptoAsset, displayBN, displayFullBN, Token, TokenLabel } from 'util/index';
import { theme } from 'constants/index';

import { FormatTooltip, TokenTypeImageModule, QuestionModule } from './index';

const useStyles = makeStyles({
  inputText: {
    fontSize: 'calc(15px + 1vmin)',
    fontFamily: 'Lucida Console',
    fontWeight: 400,
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
  width: '25px',
};

export type TokenInputFieldProps = {
  /** Input label */
  label: string | null;
  /** ??? */
  // action: string;
  /** Hide the entire input */
  hidden?: boolean; // default false
  /** Prevent interaction with input */
  locked?: boolean; // default false
  /** ??? */
  // maxval: number;
  /** Show the icon for this token to the right of the input */
  token?: Token;
  poolForLPRatio?: any;
  /** */
  balanceLabel?: string;
  /** */
  balance?: BigNumber;
  range: boolean;
  isLP: boolean;
  // Handlers
  /** */
  maxHandler?: Function;
  /** */
  handleChange: Function;
  /** */
  handleSlider: Function;
  // Input values
  /** The numerical value stored in the Input */
  value: BigNumber;
  /** Input placeholder */
  placeholder?: string;
  /** Error */
  error?: string | boolean;
  /** */
  description: string;
  /**  */
  inputClassname?: string;
}

export default function TokenInputField(props: TokenInputFieldProps) {
  const classes = useStyles();
  /** */
  const [displayValue, setDisplayValue] = useState('');
  const label = props.label || TokenLabel(props.token);

  function maxButton() {
    if (props.maxHandler !== undefined) {
      return (
        <Button
          onClick={props.maxHandler}
          style={maxStyle}
          disabled={props.locked}>
          Max
        </Button>
      );
    }
    return null;
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
    return `${displayBN(balance[0])} BEAN/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
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

  // If we're provided a `range`
  let marks = null;
  let showSlider = null;
  let startAdornment = null;
  if (props.balance && props.range) {
    startAdornment = (
      <InputAdornment position="start">
        <span style={{ fontSize: 'calc(14px + 1vmin)', fontFamily: 'Lucida Console', display: 'flex' }}>
          0&nbsp;-
        </span>
      </InputAdornment>
    );
    marks = [
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
    ];
    showSlider = (
      <Box style={{ padding: '0 10px' }}>
        <Slider
          // NOTE: this assumes props.value is
          // a BigNumber. If we want to do multiple handles,
          // this needs to be an array.
          value={props.value.toNumber()}
          onChange={handleSlider}
          aria-labelledby="input-slider"
          min={0}
          step={10000}
          max={props.balance.toNumber()}
          marks={marks}
        />
      </Box>
    );
  }

  if (props.hidden) return null;

  return (
    <Box style={{ margin: '8px 0' }}>
      <Box className={classes.smallLabels}>
        <Box className={classes.leftStyle}>
          {props.description
            ? (
              <Box>
                {label}
                <QuestionModule
                  description={props.description}
                  margin="-10px 0 0 0"
                  placement="right"
                />
              </Box>
            )
            : label
          }
        </Box>
        {props.balance && !props.range && (
          <FormatTooltip placement="right" title={balanceContent}>
            <Box className={classes.rightStyle}>
              &nbsp;{`${props.balanceLabel}: ${displayBN(props.balance)}`}
            </Box>
          </FormatTooltip>
        )}
      </Box>
      {/* Allow a range slider */}
      {showSlider}
      {/* Show the text input field */}
      <TextField
        className="TextField-rounded"
        placeholder={props.placeholder || '0.0000'}
        variant="outlined"
        size={props.size}
        type="number"
        disabled={props.handleChange === undefined || props.locked}
        error={Boolean(props.error)}
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
          // Styles
          inputProps: {
            min: 0.0,
            step: 1.0,
            inputMode: 'decimal',
          },
          classes: {
            input: `${classes.inputText} ${props.inputClassname}`,
          },
          // Adornments
          endAdornment,
          startAdornment,
        }}
      />
    </Box>
  );
}

// FIXME: reorganize to match about type def
// FIXME: what are 'action' and 'maxval' for?
TokenInputField.defaultProps = {
  // action: 'Deposit',
  hidden: false,
  locked: false,
  // maxval: 0,
  token: 'Beans',
  size: 'medium',
  poolForLPRatio: undefined,
  balanceLabel: 'Balance',
  balance: undefined,
  maxHandler: undefined,
  placeholder: undefined,
  error: undefined,
  inputClassname: undefined,
};

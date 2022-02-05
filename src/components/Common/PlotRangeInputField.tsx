import React from 'react';
import { Box, Button, Grid, InputAdornment, Slider, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import BigNumber from 'bignumber.js';

import { CryptoAsset, displayBN, displayFullBN, Token, TokenLabel } from 'util/index';
import { theme } from 'constants/index';

import { FormatTooltip, QuestionModule } from './index';

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

// NOTE: high overlap with TokenInputFieldProps
export type PlotRangeInputFieldProps = {
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
  minHandler?: Function;
  maxHandler?: Function;
  /** */
  handleChange: Function;
  /** */
  handleSlider: Function;
  // Input values
  /** The numerical value stored in the Input */
  value: [BigNumber, BigNumber]; // two endpoints
  /** Input placeholder */
  placeholder?: string;
  /** Error */
  error?: string | boolean;
  /** */
  description: string;
  /** */
  disableSlider: boolean;
}

const minMaxStyle = {
  backgroundColor: theme.primary,
  borderRadius: '30px',
  color: theme.accentText,
  fontSize: '13px',
  fontFamily: 'Futura-PT-Book',
  height: '25px',
  minWidth: '50px',
};

/**
 * NOTE:
 * This component a temporary hack to ship the Pod Market quickly.
 * This input field should be standardized and handle 1 or 2 inputs
 * without needing to create a second type of component.
 */
export default function TokenInputField(props: PlotRangeInputFieldProps) {
  const classes = useStyles();
  /** */
  // const [displayValue, setDisplayValue] = useState('');
  const label = props.label || TokenLabel(props.token);

  function minButton() {
    if (props.minHandler !== undefined) {
      return (
        <Button
          onClick={props.minHandler}
          style={minMaxStyle}
          disabled={props.locked}>
          Min
        </Button>
      );
    }
  }

  function maxButton() {
    if (props.maxHandler !== undefined) {
      return (
        <Button
          onClick={props.maxHandler}
          style={minMaxStyle}
          disabled={props.locked}>
          Max
        </Button>
      );
    }
  }

  const handleChange = (value: PlotRangeInputFieldProps['value']) => {
    // setDisplayValue(event.target.value);
    props.handleChange(value);
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

  // If we're provided a `range`
  let marks = null;
  let showSlider = null;
  if (props.balance && props.range) {
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
          value={[
            props.value[0].toNumber(),
            props.value[1].toNumber()
          ]}
          onChange={!props.disableSlider ? (event, newValue: number[]) => handleChange([
            new BigNumber(newValue[0]),
            new BigNumber(newValue[1]),
          ]) : null}
          aria-labelledby="input-slider"
          min={0}
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
      <Grid container spacing={1}>
        <Grid item xs>
          <TextField
            className="TextField-rounded"
            placeholder={props.placeholder || '0.0000'}
            variant="outlined"
            size="medium"
            type="number"
            // disabled={true}
            disabled={props.handleChange === undefined || props.locked}
            error={Boolean(props.error)}
            value={props.value[0].isLessThan(0) ? '0' : props.value[0].toFixed()}
            onChange={(event) => {
              // Change only the first item
              handleChange([
                new BigNumber(event.target?.value || -1),
                props.value[1],
              ]);
            }}
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
              endAdornment: (
                <InputAdornment position="end">
                  {minButton()}
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs>
          <TextField
            className="TextField-rounded"
            placeholder={props.placeholder || '0.0000'}
            variant="outlined"
            size="medium"
            type="number"
            disabled={props.handleChange === undefined || props.locked}
            error={Boolean(props.error)}
            value={props.value[1].isLessThan(0) ? '0' : props.value[1].toFixed()}
            onChange={(event) => {
              // Change only the second item
              handleChange([
                props.value[0],
                new BigNumber(event.target?.value || -1),
              ]);
            }}
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
              endAdornment: (
                <InputAdornment position="end">
                  {maxButton()}
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(props.value)}</pre> */}
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
  poolForLPRatio: undefined,
  balanceLabel: 'Balance',
  balance: undefined,
  minHandler: undefined,
  maxHandler: undefined,
  placeholder: undefined,
  error: undefined,
  disableSlider: false,
};

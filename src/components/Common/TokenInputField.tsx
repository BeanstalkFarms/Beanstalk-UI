import React, { useState } from 'react';
import { Box, Button, InputAdornment, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CryptoAsset, displayBN, displayFullBN, TokenLabel } from 'util/index';
import { theme } from 'constants/index';
import { FormatTooltip, TokenTypeImageModule } from './index';

export default function TokenInputField(props) {
  const [displayValue, setDisplayValue] = useState('');

  const classes = makeStyles(() => ({
    inputText: {
      fontSize: 'calc(15px + 1vmin)',
      fontFamily: 'Lucida Console',
      fontWeight: '400',
      color: theme.text,
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
  const rightStyle = {
    display: 'inline-block',
    float: 'right',
    marginRight: '13px',
    textAlign: 'right' as const,
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
  const tokenTypeImageStyle = {
    height: '30px',
    marginLeft: '5px',
    width: '20px',
  };

  const label = props.label || TokenLabel(props.token);

  function maxButton() {
    if (props.maxHandler !== undefined) {
      return (
        <Button onClick={props.maxHandler} style={maxStyle}>
          Max
        </Button>
      );
    }
  }

  const handleChange = (event) => {
    setDisplayValue(event.target.value);
    props.handleChange(event);
  };

  function displayLP(balance) {
    return `${displayBN(balance[0])} ${TokenLabel(
      CryptoAsset.Bean
    )}/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  let balanceContent = null
  if (props.balance) {
    balanceContent = props.isLP && props.poolForLPRatio !== undefined
      ? displayLP(props.poolForLPRatio(props.balance))
      : `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`;
  }

  const endAdornment = (
    <InputAdornment position="end">
      {maxButton()}
      <TokenTypeImageModule style={tokenTypeImageStyle} token={props.token} />
    </InputAdornment>
  );

  if (props.hidden) return null;

  return (
    <Box style={{ margin: '8px 0' }}>
      <Box style={smallLabels}>
        <Box style={leftStyle}>{label}</Box>
        { props.balance && (
          <FormatTooltip placement="right" title={balanceContent}>
            <Box style={rightStyle}>
              &nbsp;{`Balance: ${displayBN(props.balance)}`}
            </Box>
          </FormatTooltip>
        ) }
      </Box>

      <TextField
        className="TextField-rounded"
        placeholder={props.placeholder || "0.0000"}
        variant="outlined"
        size="medium"
        type="number"
        disabled={props.handleChange === undefined || props.locked}
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

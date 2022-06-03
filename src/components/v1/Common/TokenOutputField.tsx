import React from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { TrimBN, TokenLabel } from 'util/index';
import { TokenTypeImageModule } from '.';

const useStyles = makeStyles({
  inputText: {
    fontSize: 'calc(12px + 1vmin)',
    fontFamily: 'Lucida Console',
  },
  smallLabels: {
    fontFamily: 'Futura-PT-Book',
    fontSize: 'calc(9px + 0.7vmin)',
  },
  leftStyle: {
    display: 'inline-block',
    float: 'left',
    fontFamily: 'Futura-PT-Book',
    marginLeft: '13px',
    textAlign: 'left' as const,
    textTransform: 'uppercase' as const,
    width: '100%',
  },
  tokenStyle: {
    height: '30px',
    marginLeft: '-10px',
    width: '25px',
  }
});

export default function TokenOutputField(props) {
  const classes = useStyles();

  const tokenStyle = {
    height: '30px',
    marginLeft: '-10px',
    width: '25px',
  };

  const tokenLabel = props.title !== undefined
    ? props.title
    : TokenLabel(props.token);
  const endAdornment = (
    <InputAdornment position="end">
      <TokenTypeImageModule style={tokenStyle} token={props.token} />
    </InputAdornment>
  );

  let startAdornment = props.burn ? (
    <InputAdornment position="start">–</InputAdornment>
  ) : null;
  startAdornment = props.mint ? (
    <InputAdornment position="start">+</InputAdornment>
  ) : (
    startAdornment
  );

  let className = 'TextField-rounded';
  if (props.mint) className = 'TextField-rounded-mint';
  if (props.burn) className = 'TextField-rounded-burn';

  return (
    <Box style={{ margin: '8px 0' }}>
      <Box className={classes.smallLabels}>
        <Box className={classes.leftStyle}>{tokenLabel}</Box>
      </Box>

      <TextField
        className={className}
        placeholder="0.0000"
        variant="outlined"
        size="small"
        type="number"
        style={{ fontSize: '10px' }}
        disabled={props.handleChange === undefined}
        value={
          props.decimals !== undefined
            ? TrimBN(props.value, props.decimals)
            : props.value
        }
        onChange={props.handleChange}
        fullWidth
        InputProps={{
          inputProps: {
            min: 0.0,
            step: 1.0,
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

TokenOutputField.defaultProps = {
  action: 'Deposit',
  decimals: undefined,
  maxval: 0,
  token: 'Beans',
};
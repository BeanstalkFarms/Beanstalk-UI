import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box, InputAdornment, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { BASE_SLIPPAGE, SLIPPAGE_THRESHOLD } from 'constants/index';
import { QuestionModule } from './index';

const useStyles = makeStyles({
  inputText: {
    textAlign: 'right',
    fontSize: '16px',
    fontFamily: 'Futura-PT-Book',
  },
  textStyle: {
    margin: '0 auto', width: '90%'
  }
});

export default function SlippageModule(props) {
  const classes = useStyles();
  const [isFieldEmpty, setIsFieldEmpty] = useState(false);

  const defaultSlippage = new BigNumber(1)
    .minus(BASE_SLIPPAGE)
    .multipliedBy(100);

  return (
    <Box>
      <Box
        sx={{
          padding: '5px',
          fontFamily: 'Futura-PT-Book',
          fontSize: '11px',
        }}
      >
        Slippage:
        <QuestionModule
          description="Customize the maximum difference between the current price and the price when your transaction is mined."
          margin="-5px 0 0 -1px"
        />
      </Box>
      <TextField
        variant="standard"
        type="number"
        error={
          !isFieldEmpty &&
          props.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD)
        }
        placeholder={defaultSlippage.toFixed()}
        value={
          isFieldEmpty
            ? ''
            : new BigNumber(1).minus(props.slippage).multipliedBy(100)
        }
        className={classes.textStyle}
        onChange={(e) => {
          function setSlippagePercentage(newPercentage: BigNumber) {
            props.setSlippage(
              new BigNumber(100).minus(newPercentage).multipliedBy(0.01)
            );
          }
          if (e.target.value) {
            const newValue = new BigNumber(e.target.value);
            if (newValue.isLessThan(0) || newValue.isGreaterThan(100)) {
              return;
            }
            if (newValue.isEqualTo(0)) {
              setSlippagePercentage(defaultSlippage);
              setIsFieldEmpty(true);
              return;
            }

            const slippage = newValue.toFixed();
            const decimalIndex = slippage.indexOf('.');
            const numberOfDecimals =
              decimalIndex > -1 ? slippage.length - decimalIndex - 1 : -1;
            if (numberOfDecimals > 1) {
              return;
            }
            setSlippagePercentage(new BigNumber(newValue.toFixed(1)));
            setIsFieldEmpty(false);
          } else {
            setSlippagePercentage(defaultSlippage);
            setIsFieldEmpty(true);
          }
        }}
        // onWheel={(e) => e.target.blur()}
        onKeyDown={(e) =>
          (e.key === 'e' || e.key === '+' || e.key === '-') &&
          e.preventDefault()
        }
        InputProps={{
          inputProps: {
            min: 0.1,
            max: 100,
            step: 0.1,
          },
          classes: {
            input: classes.inputText,
          },
          endAdornment: (
            <InputAdornment position="end" style={{ marginLeft: '2px' }}>
              %
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

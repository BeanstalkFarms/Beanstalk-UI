import React from 'react';
import { Box, Grid } from '@mui/material';
import BigNumber from 'bignumber.js';
import SliderField from './SliderField';
import { TokenInputField } from './index';
import { ZERO_BN } from '../../../constants';

export type DoubleSliderFieldProps = {
  balance: BigNumber;
  sliderFields: string[];
  disableSlider?: boolean;
}

const SLIDER_FIELD_KEYS = ['start', 'end'];
const InputPropsLeft  = { endAdornment: 'Start' };
const InputPropsRight = { endAdornment: 'End' };

const DoubleSliderField: React.FC<DoubleSliderFieldProps> = React.memo(({
  balance,
  sliderFields,
  disableSlider = false,
}) => {
  const balanceNum = balance.toNumber();
  return (
    <>
      <Box px={1}>
        <SliderField
          min={0}
          max={balanceNum}
          fields={sliderFields}
          initialState={[0, balanceNum]}
          disabled={disableSlider}
          // changeMode="onChangeCommitted"
        />
      </Box>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TokenInputField
            name={sliderFields[0]}
            placeholder="0.0000"
            balance={balance || ZERO_BN}
            hideBalance
            InputProps={InputPropsLeft}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TokenInputField
            name={sliderFields[1]}
            placeholder="0.0000"
            balance={balance || ZERO_BN}
            hideBalance
            InputProps={InputPropsRight}
            size="small"
          />
        </Grid>
      </Grid>
    </>
  );
});

export default DoubleSliderField;

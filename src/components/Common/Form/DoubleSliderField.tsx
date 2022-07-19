import React from 'react';
import { Box, Grid } from '@mui/material';
import BigNumber from 'bignumber.js';
import SliderField from './SliderField';
import { TokenInputField } from './index';
import { ZERO_BN } from '../../../constants';

export type RadioCardFieldProps = {
  balance: BigNumber;
  sliderFields: string[];
  disableSlider?: boolean;
}

const DoubleSliderField: React.FC<RadioCardFieldProps> =
  ({
     balance,
     sliderFields,
     disableSlider = false,
   }) => (
     <>
       <Box px={1}>
         <SliderField
           min={0}
           max={balance.toNumber()}
           fields={sliderFields}
           initialState={[0, balance.toNumber()]}
           disabled={disableSlider}
        />
       </Box>
       <Grid container spacing={1}>
         <Grid item xs={6}>
           <TokenInputField
             name={sliderFields[0]}
             placeholder="0.0000"
             balance={balance || ZERO_BN}
             hideBalance
             InputProps={{
              endAdornment: 'Start'
            }}
             size="small"
          />
         </Grid>
         <Grid item xs={6}>
           <TokenInputField
             name={sliderFields[1]}
             placeholder="0.0000"
             balance={balance || ZERO_BN}
             hideBalance
             InputProps={{
              endAdornment: 'End'
            }}
             size="small"
          />
         </Grid>
       </Grid>
     </>
  );

export default DoubleSliderField;

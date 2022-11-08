import { Stack, InputAdornment, Typography, Divider } from '@mui/material';
import React from 'react';
import Row from '~/components/Common/Row';
import AtomInputField from '../common/AtomInputField';
import FulfillOrderAmount from '../common/FulfillOrderAmount';
import PlaceInLineSlider from '../common/PlaceInLineSlider';
import PricingFnSelect from '../common/PricingFnSelect';

import { placeInLineAtom, fulfillAmountAtom } from '../info/atom-context';

const CreateBuyOrder: React.FC<{}> = () => (
  <>
    <PlaceInLineSlider />
    <Stack gap={0.8}>
      {/*
       *(max) place in line input
       */}
      <AtomInputField
        atom={placeInLineAtom}
        disabled
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography
                color="text.primary"
                variant="caption"
                sx={{ mt: 0.2 }}
              >
                MAX PLACE IN LINE
              </Typography>
            </InputAdornment>
          ),
        }}
      />
      <Divider />
      <Row spacing={0.8} width="100%">
        {/*
         * fixed / dynamic pricing fn select
         */}
        <PricingFnSelect />
        {/*
         * payment amount in beans
         */}
        <AtomInputField
          atom={fulfillAmountAtom}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography
                  color="text.primary"
                  variant="caption"
                  sx={{ mt: 0.2 }}
                >
                  PRICE
                </Typography>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="start">
                <Typography
                  color="text.primary"
                  variant="caption"
                  sx={{ ml: 0.5, mt: 0.2 }}
                >
                  BEAN
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Row>
      <Divider />
      <FulfillOrderAmount />
    </Stack>
  </>
);

export default CreateBuyOrder;

import React from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Box, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { BuyOrderFormValues } from '../../Dialogs/BuyOrderDialog';
import SliderInputField from '../../../Common/Form/Field/SliderInputField';
import { POD_MARKET_TOOLTIPS } from '../../../../constants/tooltips';
import InputAmountField from '../../../Common/Form/Field/InputAmountField';
import podsIcon from '../../../../img/beanstalk/pod-icon.svg';
import { BeanstalkPalette } from '../../../App/muiTheme';
import beanIcon from "../../../../img/tokens/bean-logo-circled.svg";

export type BuyOrderFormProps = {
  podLine: BigNumber;
}

const BuyOrderForm: React.FC<BuyOrderFormProps & FormikProps<BuyOrderFormValues>> = ({
  values,
  podLine,
  setFieldValue,
  isSubmitting,
}) => (
  <Form noValidate>
    {/* Selected value: {values.option?.toString()} */}
    <pre>{JSON.stringify({ ...values }, null, 2)}</pre>
    <Stack gap={1}>
      <Stack gap={0.8}>
        <Box pl={0.5}>
          <Tooltip placement="bottom-start" title="">
            <Typography>Place in Line</Typography>
          </Tooltip>
        </Box>
        <Field name="placeInLine">
          {(fieldProps: FieldProps) => (
            <SliderInputField
              {...fieldProps}
              min={0}
              max={podLine.toNumber()}
              displayValues={values.placeInLine ? [values.placeInLine.toNumber()] : [0]}
            />
          )}
        </Field>
      </Stack>
      <Box>
        <Field name="placeInLine">
          {(fieldProps: FieldProps) => (
            <InputAmountField
              {...fieldProps}
              minValue={new BigNumber(0)}
              placeholder={podLine.toNumber().toString()}
              maxValue={podLine}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Stack sx={{ pr: 0 }} alignItems="center">
                      {/* <img src={podsIcon} alt="" height="30px" /> */}
                      <Typography color={BeanstalkPalette.black} sx={{ mt: 0.09, mr: -0.2, fontSize: '1.5rem' }}>0 -</Typography>
                    </Stack>
                  </InputAdornment>)
              }}
              // disabled
            />
          )}
        </Field>
      </Box>
      <Stack gap={0.8}>
        <Box pl={0.5}>
          <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.createPodListingForm.pricePerPod}>
            <Typography>Price Per Pod</Typography>
          </Tooltip>
        </Box>
        <Field name="pricePerPod">
          {(fieldProps: FieldProps) => (
            <InputAmountField
              {...fieldProps}
              placeholder="0.0000"
              showMaxButton
              InputProps={{
                inputProps: { step: '0.01' },
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>
                      <img src={beanIcon} alt="" height="30px" />
                      <Typography sx={{ fontSize: '20px' }}>BEAN</Typography>
                    </Stack>
                  </InputAdornment>)
              }}
              maxValue={new BigNumber(1)}
              minValue={new BigNumber(0)}
            />
          )}
        </Field>
      </Stack>
    </Stack>
  </Form>
  );

export default BuyOrderForm;

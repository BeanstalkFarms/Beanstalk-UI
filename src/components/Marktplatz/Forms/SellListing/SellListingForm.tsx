import React, { useEffect } from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Box, Button, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podsIcon from 'img/beanstalk/pod-icon.svg';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SellListingFormValues } from '../../Dialogs/SellListingDialog';
import CardField from '../../../Common/Form/Field/CardField';
import PlotDetails from './PlotDetails';
import InputAmountField from '../../../Common/Form/Field/InputAmountField';
import { ZERO_BN } from '../../../../constants';
import { MaxBN, MinBN } from '../../../../util';
import { POD_MARKET_TOOLTIPS } from '../../../../constants/tooltips';
import { BeanstalkPalette } from '../../../App/muiTheme';
import SliderInputField from '../../../Common/Form/Field/SliderInputField';

export type SellListingFormProps = {
  plot: any;
  placeInLine: BigNumber;
  numPods: BigNumber;
}

const SellListingForm: React.FC<SellListingFormProps & FormikProps<SellListingFormValues>> = ({
  plot,
  placeInLine,
  numPods,
  values,
  setFieldValue,
  isSubmitting,
}) => {
  const handleChangeAmount = (amount: BigNumber) => {
    const delta = (values?.max || ZERO_BN).minus(amount);
    setFieldValue('min', MaxBN(ZERO_BN, delta));
    if (delta.lt(0)) {
      setFieldValue('max', MinBN(numPods, (values?.max || ZERO_BN).plus(delta.abs())));
    }
  };

  useEffect(() => {
    setFieldValue('amount', values.max?.minus(values.min ? values.min : ZERO_BN));
  }, [values.min, values.max, setFieldValue]);

  return (
    <Form noValidate>
      {/* Selected value: {values.option?.toString()} */}
      {/* <pre>{JSON.stringify({ ...values, ...{ selectedPlot: { ...plot } } }, null, 2)}</pre> */}
      <Stack gap={1}>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Plot to List</Typography>
          </Box>
          <PlotDetails placeInLine={placeInLine} numPods={numPods} />
        </Stack>
        <Box px={3}>
          {/* double slider sets the form's 'min' and 'max' values */}
          {/* so we leave the name field blank */}
          <Field name="">
            {(fieldProps: FieldProps) => (
              <SliderInputField
                {...fieldProps}
                min={0}
                max={numPods.toNumber()}
                initialState={[0, numPods.toNumber()]}
              />
            )}
          </Field>
        </Box>
        <Stack direction="row" gap={1}>
          <Box width="50%">
            <Stack gap={0.8}>
              <Box pl={0.5}>
                <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.start}>
                  <Typography>Start</Typography>
                </Tooltip>
              </Box>
              <Field name="min">
                {(fieldProps: FieldProps) => (
                  <InputAmountField
                    {...fieldProps}
                    placeholder="0.0000"
                    minValue={new BigNumber(0)}
                    maxValue={values.max ? values.max.minus(1) : numPods.minus(1)}
                  />
                )}
              </Field>
            </Stack>
          </Box>
          <Box width="50%">
            <Stack gap={0.8}>
              <Box pl={0.5}>
                <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.end}>
                  <Typography>End</Typography>
                </Tooltip>
              </Box>
              <Field name="max">
                {(fieldProps: FieldProps) => (
                  <InputAmountField
                    {...fieldProps}
                    placeholder="0.0000"
                    minValue={new BigNumber(0)}
                    maxValue={numPods}
                  />
                )}
              </Field>
            </Stack>
          </Box>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.amount}>
              <Typography>Amount</Typography>
            </Tooltip>
          </Box>
          <Field name="amount">
            {(fieldProps: FieldProps) => (
              <InputAmountField
                {...fieldProps}
                handleChangeOverride={handleChangeAmount}
                maxValue={numPods}
                minValue={new BigNumber(0)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" gap={0.3} alignItems="center" sx={{ pr: 1 }}>
                        <img src={podsIcon} alt="" height="30px" />
                        <Typography sx={{ fontSize: '20px' }}>PODS</Typography>
                      </Stack>
                    </InputAdornment>)
                }}
                // disabled
              />
            )}
          </Field>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.pricePerPod}>
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
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.expiresAt}>
              <Typography>Expires At</Typography>
            </Tooltip>
          </Box>
          <Field name="expiresAt">
            {(fieldProps: FieldProps) => (
              <InputAmountField
                {...fieldProps}
                placeholder="0.0000"
                showMaxButton
                minValue={new BigNumber(0)}
                maxValue={placeInLine.plus(values.min ? values.min : ZERO_BN)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ pr: 1 }}>
                        <Typography sx={{ fontSize: '18px' }}>Place in Line</Typography>
                      </Box>
                    </InputAdornment>)
                }}
              />
            )}
          </Field>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Receive Beans to</Typography>
          </Box>
          <CardField
            name="option"
            // Grid Props
            spacing={1}
            direction="row"
            xs={12}
            md={6}
            options={[
              {
                title: 'Wallet',
                description: 'Beans will be delivered directly to your wallet',
                value: 0,
              },
              {
                title: 'Farmable Balance',
                description: 'Beans will be made Farmable within Beanstalk',
                value: 1,
              }
            ]}
            sx={{
              width: '100%'
            }}
          />
        </Stack>
        <Stack direction="row" sx={{ p: 1, backgroundColor: BeanstalkPalette.lightYellow, borderRadius: 1 }} alignItems="center" gap={1}>
          <WarningAmberIcon sx={{ ml: 0.5, color: BeanstalkPalette.warningYellow }} />
          <Typography>Pods in this Plot are already Listed on the Pod Market. Listing Pods from the same Plot will replace the previous Pod Listing.</Typography>
        </Stack>
        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

export default SellListingForm;

import React, { useEffect } from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Box, Button, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import CardField from '../../../Common/Form/Field/CardField';
import PlotDetails from './PlotDetails';
import InputAmountField from './InputAmountField';
import { ZERO_BN } from '../../../../constants';
import SliderInputField from './SliderInputField';
import { MaxBN, MinBN } from '../../../../util';

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
          <Field name="min">
            {(fieldProps: FieldProps) => (
              <SliderInputField
                {...fieldProps}
                min={0}
                max={numPods.toNumber()}
                displayValues={(values.min && values.max) ? [values.min?.toNumber(), values.max?.toNumber()] : [0, numPods.toNumber()]}
              />
            )}
          </Field>
        </Box>
        <Stack direction="row" gap={1}>
          <Box width="50%">
            <Stack gap={0.8}>
              <Box pl={0.5}>
                <Typography>Start</Typography>
              </Box>
              <Field name="min">
                {(fieldProps: FieldProps) => (
                  <InputAmountField
                    {...fieldProps}
                    placeholder="0.0000"
                    maxValue={values.max ? values.max : numPods}
                  />
                )}
              </Field>
            </Stack>
          </Box>
          <Box width="50%">
            <Stack gap={0.8}>
              <Box pl={0.5}>
                <Typography>End</Typography>
              </Box>
              <Field name="max">
                {(fieldProps: FieldProps) => (
                  <InputAmountField
                    {...fieldProps}
                    placeholder="0.0000"
                    maxValue={numPods}
                  />
                )}
              </Field>
            </Stack>
          </Box>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Amount</Typography>
          </Box>
          <Field name="amount">
            {(fieldProps: FieldProps) => (
              <InputAmountField
                {...fieldProps}
                handleChangeOverride={handleChangeAmount}
                maxValue={numPods}
                // disabled
              />
            )}
          </Field>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Price Per Pod</Typography>
          </Box>
          <Field name="pricePerPod">
            {(fieldProps: FieldProps) => (
              <InputAmountField
                {...fieldProps}
                placeholder="0.0000"
                showMaxButton
                InputProps={{ inputProps: { step: '0.01' } }}
                maxValue={new BigNumber(1)}
                minValue={new BigNumber(0)}
              />
            )}
          </Field>
        </Stack>
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Typography>Expires At</Typography>
          </Box>
          <Field name="expiresAt">
            {(fieldProps: FieldProps) => (
              <InputAmountField
                {...fieldProps}
                placeholder="0.0000"
                showMaxButton
                maxValue={placeInLine.plus(values.min ? values.min : ZERO_BN)}
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
        <Button sx={{ p: 1 }} type="submit">
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

export default SellListingForm;

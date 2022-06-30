import React, { useEffect } from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Box, Button, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podsIcon from 'img/beanstalk/pod-icon.svg';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SellListingFormValues } from '../Dialogs/SellListingDialog';
import RadioCardField from '../../Common/Form/RadioCardField';
import PlotDetails from '../Cards/PlotDetails';
import InputField from '../../Common/Form/InputField';
import { ZERO_BN } from '../../../constants';
import { MaxBN, MinBN } from '../../../util';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import { BeanstalkPalette } from '../../App/muiTheme';
import SliderField from '../../Common/Form/SliderField';
import { SellNowFormValues } from '../Dialogs/SellNowDialog';

export type SellNowFormProps = {
  plot: any;
  placeInLine: BigNumber;
  numPods: BigNumber;
}

const SellNowForm: React.FC<SellNowFormProps & FormikProps<SellNowFormValues>> = ({
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
        <Stack gap={0.8}>
          <Box pl={0.5}>
            <Tooltip placement="bottom-start" title={POD_MARKET_TOOLTIPS.amount}>
              <Typography>Number of Pods to sell</Typography>
            </Tooltip>
          </Box>
          <Field name="amount">
            {(fieldProps: FieldProps) => (
              <InputField
                {...fieldProps}
                handleChangeOverride={handleChangeAmount}
                maxValue={numPods}
                minValue={new BigNumber(0)}
                showMaxButton
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
        <Box px={3}>
          {/* double slider sets the form's 'min' and 'max' values */}
          {/* so we leave the name field blank */}
          <Field name="">
            {(fieldProps: FieldProps) => (
              <SliderField
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
                  <InputField
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
                  <InputField
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
        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

export default SellNowForm;

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
import Warning from '../../Common/Form/Warning';
import FieldWrapper from '../../Common/Form/FieldWrapper';

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
      <Stack gap={1}>
        <FieldWrapper label="Plot to List">
          <PlotDetails placeInLine={placeInLine} numPods={numPods} />
        </FieldWrapper>
        <Box px={3}>
          {/* double slider sets the form's 'min' and 'max' values */}
          {/* so we leave the name field blank */}
          <SliderField
            min={0}
            fields={['min', 'max']}
            max={numPods.toNumber()}
            initialState={[0, numPods.toNumber()]}
          />
        </Box>
        <Stack direction="row" gap={1}>
          <Box width="50%">
            <FieldWrapper label="Start" tooltip={POD_MARKET_TOOLTIPS.start}>
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
            </FieldWrapper>
          </Box>
          <Box width="50%">
            <Stack gap={0.8}>
              <FieldWrapper label="End" tooltip={POD_MARKET_TOOLTIPS.end}>
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
              </FieldWrapper>
            </Stack>
          </Box>
        </Stack>
        <FieldWrapper label="Amount" tooltip={POD_MARKET_TOOLTIPS.amount}>
          <Field name="amount">
            {(fieldProps: FieldProps) => (
              <InputField
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
        </FieldWrapper>
        <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
          <Field name="pricePerPod">
            {(fieldProps: FieldProps) => (
              <InputField
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
        </FieldWrapper>
        <FieldWrapper label="Expires At" tooltip={POD_MARKET_TOOLTIPS.expiresAt}>
          <Field name="expiresAt">
            {(fieldProps: FieldProps) => (
              <InputField
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
        </FieldWrapper>
        <FieldWrapper label="Receive Beans to">
          <RadioCardField
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
        </FieldWrapper>
        <Warning message="Pods in this Plot are already Listed on the Pod Market. Listing Pods from the same Plot will replace the previous Pod Listing." />
        <Button sx={{ p: 1 }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

export default SellListingForm;

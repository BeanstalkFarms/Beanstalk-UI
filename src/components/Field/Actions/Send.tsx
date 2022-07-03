import { Box, Button, InputAdornment, Stack, Tooltip, Typography } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import DropdownField from '../../Common/Form/DropdownField';
import SelectPlotDialog from '../SelectPlotDialog';
import PlotDetails from '../../Market/Cards/PlotDetails';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import InputField from '../../Common/Form/InputField';
import podsIcon from '../../../img/beanstalk/pod-icon.svg';
import { MaxBN, MinBN } from '../../../util';
import SliderField from '../../Common/Form/SliderField';
import Warning from "../../Common/Form/Warning";

export type SendFormValues = {
  to: string | null;
  plotIndex: string | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

export interface SendFormProps {

}

const SendForm: React.FC<SendFormProps & FormikProps<SendFormValues>> = ({
                                                                           values,
                                                                           setFieldValue
                                                                         }) => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const numPods = useMemo(() => (values?.plotIndex ? new BigNumber(farmerField.plots[values?.plotIndex]) : ZERO_BN), [farmerField.plots, values?.plotIndex]);

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handlePlotSelect = (index: string) => {
    setFieldValue('plotIndex', index);
  };

  const handleChangeAmount = (amount: BigNumber) => {
    const delta = (values?.max || ZERO_BN).minus(amount);
    setFieldValue('min', MaxBN(ZERO_BN, delta));
    if (delta.lt(0)) {
      setFieldValue('max', MinBN(numPods, (values?.max || ZERO_BN).plus(delta.abs())));
    }
  };

  console.log('PLOT SELECTED', values?.plotIndex);

  useEffect(() => {
    if (values.plotIndex !== null) {
      setFieldValue('min', new BigNumber(0));
      setFieldValue('max', numPods);
      setFieldValue('amount', numPods);
    }
  }, [values.plotIndex, setFieldValue, numPods]);

  return (
    <Form autoComplete="off">
      <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={handleDialogClose}
        open={dialogOpen}
      />
      <Stack gap={1}>
        <FieldWrapper label="Recipient Address">
          <AddressInputField name="to" />
        </FieldWrapper>
        <FieldWrapper label="Plot to Send">
          {(values?.plotIndex === null) ? (
            <DropdownField buttonText="Select A Plot" handleOpenDialog={handleDialogOpen} />
          ) : (
            <Stack gap={1}>
              <PlotDetails
                placeInLine={new BigNumber(values?.plotIndex).minus(beanstalkField?.harvestableIndex)}
                numPods={new BigNumber(farmerField.plots[values?.plotIndex])}
                onClick={() => {
                  setDialogOpen(true);
                }}
              />
              <Box px={3}>
                <SliderField
                  min={0}
                  fields={['min', 'max']}
                  max={numPods.toNumber()}
                  initialState={[0, numPods.toNumber()]}
                />
              </Box>
              <Stack direction="row" gap={1} alignItems="end">
                <Box width="50%">
                  <FieldWrapper tooltip={POD_MARKET_TOOLTIPS.start} label="Plot Range">
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
              <Warning message="You can exchange your Pod in a decentralized fashion on the Farmers Market. Send Plots at your own risk." />
            </Stack>
          )}
        </FieldWrapper>

        <Button
          disabled={values.plotIndex === null || values.to === null}
          fullWidth
          type="submit"
          variant="contained"
          size="large">
          Send
        </Button>
      </Stack>
    </Form>
  );
};

const Send: React.FC<{}> = () => {
  // Form setup
  const initialValues: SendFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    to: null,
    plotIndex: null,
    min: null,
    max: null,
    // max: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
    amount: null,
    // amount: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
  }), []);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={() => {
      }}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <SendForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Send;

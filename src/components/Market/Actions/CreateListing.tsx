import { Box, InputAdornment, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { SettingInput, TokenAdornment, TokenInputField, TxnSettings } from 'components/Common/Form';
import { ONE_BN, ZERO_BN } from 'constants/index';
import { BEAN, PODS } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { MaxBN, MinBN, toStringBaseUnitBN , parseError } from 'util/index';
import DestinationField from 'components/Field/DestinationField';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import useGetChainToken from 'hooks/useGetChainToken';
import { BeanstalkField } from 'state/beanstalk/field';
import { Field } from 'state/farmer/field';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';
import { useSigner } from 'hooks/ledger/useSigner';
import { LoadingButton } from '@mui/lab';
import FieldWrapper from '../../Common/Form/FieldWrapper';
import { POD_MARKET_TOOLTIPS } from '../../../constants/tooltips';
import useToggle from '../../../hooks/display/useToggle';
import SelectPlotDialog from '../../Field/SelectPlotDialog';
import DoubleSliderField from '../../Common/Form/DoubleSliderField';

export type CreateListingFormValues = {
  plotIndex:   string    | null;
  amount:      BigNumber | null;
  start:       BigNumber | null;
  end:         BigNumber | null;
  pricePerPod: BigNumber | null;
  expiresAt:   BigNumber | null;
  destination: FarmToMode
}

const PricePerPodInputProps = {
  inputProps: { step: '0.01' },
  endAdornment: (
    <TokenAdornment
      token={BEAN[1]}
    />
  )
};
const ExpiresAtInputProps = {
  endAdornment: (
    <InputAdornment position="end">
      <Box sx={{ pr: 1 }}>
        <Typography sx={{ fontSize: '18px' }}>Place in Line</Typography>
      </Box>
    </InputAdornment>
  )
};

const SLIDER_FIELD_KEYS = ['start', 'end'];
const REQUIRED_KEYS = [
  'plotIndex',
  'start',
  'end',
  'pricePerPod',
  'expiresAt'
] as (keyof CreateListingFormValues)[];

const CreateListingForm: React.FC<
  FormikProps<CreateListingFormValues> & {
    farmerField:    Field;
    beanstalkField: BeanstalkField;
  }
> = ({
  values,
  setFieldValue,
  isSubmitting,
  farmerField,
  beanstalkField,
}) => {
  const [dialogOpen, showDialog, hideDialog] = useToggle();
  
  /// Derived
  const placeInLine = useMemo(
    () => (values.plotIndex ? new BigNumber(values.plotIndex).minus(beanstalkField?.harvestableIndex) : ZERO_BN),
    [beanstalkField?.harvestableIndex, values.plotIndex]
  );
  const numPods     = useMemo(
    () => (values.plotIndex ? farmerField.plots[values.plotIndex] : ZERO_BN),
    [farmerField.plots, values.plotIndex]
  );
  
  const handlePlotSelect = useCallback((index: string) => {
    setFieldValue('plotIndex', index);
    setFieldValue('start', ZERO_BN);
    setFieldValue('end', new BigNumber(farmerField.plots[index]));
    setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
    setFieldValue('expiresAt', new BigNumber(index).minus(beanstalkField?.harvestableIndex));
  }, [beanstalkField?.harvestableIndex, farmerField.plots, setFieldValue, values.end, values.start]);
  
  const handleChangeAmount = useCallback((amount: BigNumber | null) => {
    if (!amount) {
      setFieldValue('start', numPods);
      setFieldValue('end', numPods);
    } else {
      const delta = (values?.end || ZERO_BN).minus(amount);
      setFieldValue('start', MaxBN(ZERO_BN, delta));
      if (delta.lt(0)) {
        setFieldValue('end', MinBN(numPods, (values?.end || ZERO_BN).plus(delta.abs())));
      }
    }
  }, [numPods, setFieldValue, values?.end]);

  useEffect(() => {
    setFieldValue('amount', values.end?.minus(values.start ? values.start : ZERO_BN));
  }, [values.start, values.end, setFieldValue]);

  ///
  const isReady = (
    !REQUIRED_KEYS.some((k) => values[k] === null)
  );

  return (
    <Form noValidate>
      <SelectPlotDialog
        farmerField={farmerField}
        beanstalkField={beanstalkField}
        handlePlotSelect={handlePlotSelect}
        handleClose={hideDialog}
        open={dialogOpen}
      />
      <Stack gap={1}>
        {(values?.plotIndex === null) ? (
          <FieldWrapper>
            <TokenInputField
              name="amount"
              handleChange={handleChangeAmount}
              disabled
              fullWidth
              InputProps={{
                endAdornment: (
                  <TokenAdornment
                    token={PODS}
                    onClick={showDialog}
                    buttonLabel="Select Plot"
                  />
                ),
              }}
            />
          </FieldWrapper>
        ) : (
          <>
            <FieldWrapper>
              <TokenInputField
                name="amount"
                handleChange={handleChangeAmount}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <TokenAdornment
                      token={PODS}
                      onClick={showDialog}
                    />
                  ),
                }}
                balance={farmerField.plots[values.plotIndex]}
                balanceLabel="Plot Size"
              />
            </FieldWrapper>
            <FieldWrapper>
              <DoubleSliderField
                balance={numPods}
                sliderFields={SLIDER_FIELD_KEYS}
              />
            </FieldWrapper>
            <FieldWrapper label="Price Per Pod" tooltip={POD_MARKET_TOOLTIPS.pricePerPod}>
              <TokenInputField
                name="pricePerPod"
                placeholder="0.0000"
                InputProps={PricePerPodInputProps}
                max={ONE_BN}
              />
            </FieldWrapper>
            <FieldWrapper label="Expires At" tooltip={POD_MARKET_TOOLTIPS.expiresAt}>
              <TokenInputField
                name="expiresAt"
                placeholder="0.0000"
                // balanceLabel="Max Value"
                // balance={placeInLine.plus(values.start ? values.start : ZERO_BN)}
                InputProps={ExpiresAtInputProps}
                // max={}
              />
            </FieldWrapper>
            <DestinationField
              name="destination"
              walletDesc="When Pods are sold, send Beans to your wallet."
              farmDesc="When Pods are sold, send Beans to your Beanstalk farm balance."
              label="Send proceeds to"
            />
            {/* <Warning
              message="Pods in this Plot are already Listed on the Pod Market. Listing Pods from the same Plot will replace the previous Pod Listing."
            /> */}
          </>
        )}
        <LoadingButton
          variant="contained"
          color="primary"
          loading={isSubmitting}
          disabled={isSubmitting || !isReady}
          fullWidth
          size="large"
          type="submit"
        >
          Create Listing
        </LoadingButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const CreateListing: React.FC<{}> = () => {
  const initialValues: CreateListingFormValues = useMemo(() => ({
    plotIndex:   null,
    amount:      null,
    start:       null,
    end:         null,
    pricePerPod: null,
    expiresAt:   null,
    destination: FarmToMode.INTERNAL,
  }), []);

  ///
  const getChainToken = useGetChainToken();
  
  ///
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  
  ///
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback(async (values: CreateListingFormValues, formActions: FormikHelpers<CreateListingFormValues>) => {
    const Bean = getChainToken(BEAN);
    let txToast;
    try {
      // if (REQUIRED_KEYS.some((k) => values[k] === null)) throw new Error('Missing data');
      const { plotIndex, start, end, pricePerPod, expiresAt } = values;
      if (!plotIndex || !start || !end || !pricePerPod || !expiresAt) throw new Error('Missing data');

      const plotIndexBN = new BigNumber(plotIndex);
      const numPods     = farmerField.plots[plotIndex];

      if (!numPods) throw new Error('Plot not found.');
      if (start.gte(end)) throw new Error('Invalid start/end parameter.');
      if (pricePerPod.gt(1)) throw new Error('Price per pod cannot be more than 1.');
      if (expiresAt.gt(plotIndexBN.minus(beanstalkField.harvestableIndex).plus(start))) throw new Error('This listing would expire after the Plot harvests.');

      txToast = new TransactionToast({
        loading: 'Creating listing',
        success: 'Listing created',
      });

      const txn = await beanstalk.createPodListing(
        toStringBaseUnitBN(plotIndex, Bean.decimals),
        toStringBaseUnitBN(start,     Bean.decimals),
        toStringBaseUnitBN(end,       Bean.decimals),
        toStringBaseUnitBN(pricePerPod, Bean.decimals),
        toStringBaseUnitBN(expiresAt, Bean.decimals),
        values.destination,
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      txToast.success(receipt);
    } catch (err) {
      txToast?.error(err) || toast.error(parseError(err));
      console.error(err);
    }
  }, [beanstalk, beanstalkField.harvestableIndex, farmerField.plots, getChainToken]);

  return (
    <Formik<CreateListingFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<CreateListingFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <CreateListingForm
            farmerField={farmerField}
            beanstalkField={beanstalkField}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default CreateListing;

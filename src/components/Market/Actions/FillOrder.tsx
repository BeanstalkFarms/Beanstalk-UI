import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import {
  PlotFragment,
  PlotSettingsFragment, SmartSubmitButton,
  TokenOutputField, TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { ZERO_BN } from '~/constants/index';
import { BEAN } from '~/constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import PlotInputField from 'components/Common/Form/PlotInputField';
import useFarmerPlots from 'hooks/redux/useFarmerPlots';
import BigNumber from 'bignumber.js';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated';
import useChainConstant from 'hooks/useChainConstant';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import TransactionToast from 'components/Common/TxnToast';
import toast from 'react-hot-toast';
import { parseError } from 'util/index';
import { useSigner } from 'hooks/ledger/useSigner';
import DestinationField from 'components/Common/Form/DestinationField';
import { useFetchFarmerField } from '~/state/farmer/field/updater';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { PlotMap } from '~/state/farmer/field';
import { PodOrder } from '~/state/farmer/market';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type FillOrderFormValues = {
  plot: PlotFragment;
  destination: FarmToMode;
  settings: PlotSettingsFragment & {};
}

const FillOrderForm: React.FC<
  FormikProps<FillOrderFormValues>
  & {
    podOrder: PodOrder;
    plots: PlotMap<BigNumber>;
    harvestableIndex: BigNumber;
  }
> = ({
  //
  values,
  isSubmitting,
  //
  podOrder,
  plots: allPlots,  // rename to prevent collision
  harvestableIndex,
}) => {
  /// Derived
  const plot = values.plot;

  /// Calculations
  const [eligiblePlots, numEligiblePlots] = useMemo(() => 
    Object.keys(allPlots).reduce<[PlotMap<BigNumber>, number]>(
      (prev, curr) => {
        const indexBN = new BigNumber(curr);
        if (indexBN.minus(harvestableIndex).lt(podOrder.maxPlaceInLine)) {
          prev[0][curr] = allPlots[curr];
          prev[1] += 1;
        }
        return prev;
      },
      [{}, 0]
    ),
    [allPlots, harvestableIndex, podOrder.maxPlaceInLine]
  );
  const placeInLine   = plot.index ? new BigNumber(plot.index).minus(harvestableIndex) : undefined;
  const beansReceived = plot.amount?.times(podOrder.pricePerPod) || ZERO_BN;
  const isReady = (
    numEligiblePlots > 0
    && plot.index
    && plot.amount?.gt(0)
  );
  
  return (
    <Form autoComplete="off" noValidate>
      <Stack gap={1}>
        <PlotInputField
          plots={eligiblePlots}
          max={podOrder.remainingAmount}
          disabledAdvanced
        />
        <DestinationField name="destination" />
        {isReady && (
          <>
            <TxnSeparator mt={0} />
            <TokenOutputField
              token={BEAN[1]}
              amount={beansReceived}
              isLoading={false}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.SELL_PODS,
                        // message: `Sell ${displayTokenAmount(plot.amount!, PODS)} from your Plot at ${displayBN(placeInLine!)} in the Pod Line.`
                        podAmount: plot.amount ? plot.amount : ZERO_BN,
                        placeInLine: placeInLine !== undefined ? placeInLine : ZERO_BN
                      },
                      {
                        type: ActionType.RECEIVE_BEANS,
                        amount: beansReceived,
                        destination: values.destination,
                      },
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        )}
        <SmartSubmitButton
          loading={isSubmitting}
          disabled={!isReady}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          tokens={[]}
          mode="auto"
        >
          {numEligiblePlots === 0 ? 'No eligible Plots' : 'Fill'}
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const FillOrder: React.FC<{ podOrder: PodOrder}> = ({ podOrder }) => {
  ///
  const Bean = useChainConstant(BEAN);

  /// Data
  const allPlots         = useFarmerPlots();
  const harvestableIndex = useHarvestableIndex();
  
  /// Refetchers
  // const [refetchBeanstalkField] = useFetchBeanstalkField();
  const [refetchFarmerField]    = useFetchFarmerField();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  /// Form
  const initialValues: FillOrderFormValues = useMemo(() => ({
    plot: {
      index:  null,
      start:  ZERO_BN,
      end:    null,
      amount: null,
    },
    destination: FarmToMode.INTERNAL,
    settings: {
      showRangeSelect: false,
    }
  }), []);
  
  /// Chain
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  const onSubmit = useCallback(async (values: FillOrderFormValues, formActions: FormikHelpers<FillOrderFormValues>) => {
    let txToast;
    try {
      const { index, start, amount } = values.plot;
      if (!index) throw new Error('No plot selected');
      const numPods = allPlots[index];
      if (!numPods) throw new Error('Plot not recognized.');
      if (!start || !amount) throw new Error('Malformatted plot data.');

      console.debug('[FillOrder]', {
        numPods: numPods.toString(),
        index: index.toString(),
        start: start.toString(),
        amount: amount.toString(),
        sum: start.plus(amount).toString(),
        params: [
          {
            account:        podOrder.account,
            maxPlaceInLine: Bean.stringify(podOrder.maxPlaceInLine),
            pricePerPod:    Bean.stringify(podOrder.pricePerPod),
          },
          Bean.stringify(index),
          Bean.stringify(start),
          Bean.stringify(amount),
          FarmToMode.EXTERNAL,
        ]
      });

      txToast = new TransactionToast({
        loading: 'Filling Order...',
        // loading: `Selling ${displayTokenAmount(amount, PODS)} for ${displayTokenAmount(amount.multipliedBy(podOrder.pricePerPod), Bean)}.`,
        success: 'Fill successful.'
      });

      const txn = await beanstalk.fillPodOrder(
        {
          account:        podOrder.account,
          maxPlaceInLine: Bean.stringify(podOrder.maxPlaceInLine),
          pricePerPod:    Bean.stringify(podOrder.pricePerPod),
        },
        Bean.stringify(index),    // index of plot to sell
        Bean.stringify(start),    // start index within plot
        Bean.stringify(amount),   // amount of pods to sell
        FarmToMode.EXTERNAL,
      );
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await Promise.all([
        refetchFarmerField(),     // refresh plots; decrement pods
        refetchFarmerBalances(),  // increment balance of BEAN received
      ]);  
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      txToast?.error(err) || toast.error(parseError(err));
    } finally {
      formActions.setSubmitting(false);
    }
  }, [Bean, allPlots, beanstalk, podOrder.account, podOrder.maxPlaceInLine, podOrder.pricePerPod, refetchFarmerBalances, refetchFarmerField]);

  return (
    <Formik<FillOrderFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<FillOrderFormValues>) => (
        <FillOrderForm
          podOrder={podOrder}
          plots={allPlots}
          harvestableIndex={harvestableIndex}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default FillOrder;

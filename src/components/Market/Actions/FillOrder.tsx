import { Accordion, AccordionDetails, Box, Button, Stack } from '@mui/material';
import {
  PlotFragment,
  PlotSettingsFragment,
  TokenOutputField, TxnPreview,
  TxnSeparator
} from 'components/Common/Form';
import { ZERO_BN } from 'constants/index';
import { BEAN } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import PlotInputField from 'components/Common/Form/PlotInputField';
import { PodOrder } from 'state/farmer/market';
import useFarmerPlots from 'hooks/redux/useFarmerPlots';
import BigNumber from 'bignumber.js';
import { PlotMap } from 'state/farmer/field';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import StyledAccordionSummary from '../../Common/Accordion/AccordionSummary';
import { ActionType } from '../../../util/Actions';

export type FillOrderFormValues = {
  plot: PlotFragment;
  settings: PlotSettingsFragment & {};
}

const FillOrderForm: React.FC<
  FormikProps<FillOrderFormValues>
  & { podOrder: PodOrder; }
> = ({
  values,
  podOrder,
}) => {
  /// Data
  const allPlots = useFarmerPlots();
  const harvestableIndex = useHarvestableIndex();
  
  /// Form Data
  const plot = values.plot;

  /// Derived
  const plots = useMemo(() => Object.keys(allPlots).reduce<PlotMap<BigNumber>>((prev, curr) => {
    const indexBN = new BigNumber(curr);
    if (indexBN.minus(harvestableIndex).lt(podOrder.maxPlaceInLine)) {
      prev[curr] = allPlots[curr];
    }
    return prev;
  }, {}), [allPlots, harvestableIndex, podOrder.maxPlaceInLine]);
  
  return (
    <Form noValidate>
      <Stack gap={1}>
        <PlotInputField
          plots={plots}
        />
        {plot.index && (
          <>
            <TxnSeparator mt={0} />
            <TokenOutputField
              token={BEAN[1]}
              amount={podOrder.pricePerPod.multipliedBy(plot.amount || ZERO_BN)}
              isLoading={false}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING'
                      },
                      {
                        type: ActionType.BASE,
                        message: 'DO SOMETHING!'
                      }
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        )}
        <Button sx={{ p: 1, height: '60px' }} type="submit" disabled>
          Create Listing
        </Button>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const FillOrder: React.FC<{ podOrder: PodOrder}> = ({ podOrder }) => {
  const initialValues: FillOrderFormValues = useMemo(() => ({
    plot: {
      index:  null,
      start:  ZERO_BN,
      end:    null,
      amount: null,
    },
    settings: {
      showRangeSelect: false,
    }
  }), []);

  // eslint-disable-next-line unused-imports/no-unused-vars
  const onSubmit = useCallback((values: FillOrderFormValues, formActions: FormikHelpers<FillOrderFormValues>) => {
    Promise.resolve();
  }, []);

  return (
    <Formik<FillOrderFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<FillOrderFormValues>) => (
        <FillOrderForm
          podOrder={podOrder}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default FillOrder;

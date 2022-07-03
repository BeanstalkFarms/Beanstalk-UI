import { Button, Stack } from '@mui/material';
import AddressInputField from 'components/Common/Form/AddressInputField';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import { Form, Formik, FormikProps } from 'formik';
import React, { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import DropdownField from '../../Common/Form/DropdownField';
import SelectPlotDialog from '../SelectPlotDialog';
import PlotDetails from '../../Market/Cards/PlotDetails';
import { AppState } from '../../../state';
import { ZERO_BN } from '../../../constants';

export type SendFormValues = {
  to: string | null;
  plotIndex: string | null;
  min: BigNumber | null;
  max: BigNumber | null;
  amount: BigNumber | null;
}

export interface SendFormProps {

}

const SendForm : React.FC<SendFormProps & FormikProps<SendFormValues>> = ({
  values,
  setFieldValue
}) => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );

  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handlePlotSelect = (index: string) => {
    setFieldValue('plotIndex', index);
    if (values.plotIndex !== null) {
      setFieldValue('max', new BigNumber(farmerField.plots[values.plotIndex]));
      setFieldValue('amount', new BigNumber(farmerField.plots[values.plotIndex]));
    }
  };

  console.log('PLOT SELECTED', values?.plotIndex);

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
            <>
              <PlotDetails
                placeInLine={new BigNumber(values?.plotIndex).minus(beanstalkField?.harvestableIndex)}
                numPods={new BigNumber(farmerField.plots[values?.plotIndex])}
                onClick={() => {
                  setDialogOpen(true);
                }}
              />
            </>
          )}
        </FieldWrapper>
        <Button fullWidth type="submit" variant="contained" size="large">
          Send
        </Button>
      </Stack>
    </Form>
  );
};

const Send : React.FC<{}> = () => {
  // Form setup
  const initialValues : SendFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1, // 0.1%
    },
    to: null,
    plotIndex: null,
    min: ZERO_BN,
    max: ZERO_BN,
    // max: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
    amount: ZERO_BN,
    // amount: selectedPlotIndex ? new BigNumber(farmerField.plots[selectedPlotIndex]) : ZERO_BN,
  }), []);
  
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <SendForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Send;

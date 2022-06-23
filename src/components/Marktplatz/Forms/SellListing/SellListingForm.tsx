import React from 'react';
import { Form, FormikProps } from 'formik';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import CardField from '../../../Common/Form/Field/CardField';
import { BeanstalkPalette } from '../../../App/muiTheme';
import { displayBN } from '../../../../util';
import podIcon from '../../../../img/beanstalk/pod-icon.svg';
import PlotDetails from "./PlotDetails";

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
}) => (
  <Form noValidate>
    Selected value: {values.option?.toString()}
    <pre>{JSON.stringify({ ...values, ...{ selectedPlot: { ...plot } } }, null, 2)}</pre>
    <Stack gap={2}>
      <Stack gap={0.8}>
        <Box pl={0.5}>
          <Typography>Plot to List</Typography>
        </Box>
        <PlotDetails placeInLine={placeInLine} numPods={numPods} />
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

export default SellListingForm;

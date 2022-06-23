import React from 'react';
import { Form, FormikProps } from 'formik';
import { Button } from '@mui/material';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import CardField from '../../../Common/Form/Field/CardField';

const SellListingForm: React.FC<FormikProps<SellListingFormValues>> = ({
  values,
  setFieldValue,
  isSubmitting,
}) => (
  <Form noValidate>
    Selected value: {values.option?.toString()}
    <pre>{JSON.stringify(values, null, 2)}</pre>
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
    <Button type="submit">
      Submit
    </Button>
  </Form>
  );

export default SellListingForm;

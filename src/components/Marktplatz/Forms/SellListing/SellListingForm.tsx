import React from 'react';
import { Field, FieldProps, Form, FormikProps } from 'formik';
import { Button } from '@mui/material';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import CardField from './CardField';

const SellListingForm: React.FC<FormikProps<SellListingFormValues>> = ({
  values,
  setFieldValue,
  isSubmitting,
}) => {
  const data = [
    {
      key: 'one',
      title: 'Test Title',
    },
    {
      key: 'two',
      title: 'Test Title 2',
    },
    {
      key: 'three',
      title: 'Test Title 3',
    }
  ];

  return (
    <Form noValidate>
      Selected value: {values.destination?.toString()}
      <pre>{JSON.stringify(values, null, 2)}</pre>
      <CardField
        name="destination"
        options={[
          {
            title: "Wallet",
            description: "asdf",
            value: 0,
          },
          {
            title: "Farmable Balance",
            description: "asdf",
            value: 1,
          }
        ]}
      />
      <Field name="other">
        {(fieldProps: FieldProps) => (
          <input
            {...fieldProps.field}
          />
        )}
      </Field>
      <Button type="submit">
        Submit
      </Button>
    </Form>
  );
};

export default SellListingForm;

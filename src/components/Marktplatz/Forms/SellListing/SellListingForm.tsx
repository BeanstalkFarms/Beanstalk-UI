import React from 'react';
import { Form, FormikProps } from 'formik';
import { Button } from '@mui/material';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import CardField from './CardField';

const SellListingForm: React.FC<FormikProps<SellListingFormValues>> =
  ({
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
      {data.map((option) => (
        <CardField
          title={option.title}
          value={option.key}
          setValue={setFieldValue}
          values={values}
        />
      ))}
      <Button type="submit">
        Submit
      </Button>
    </Form>
    );
  };

export default SellListingForm;

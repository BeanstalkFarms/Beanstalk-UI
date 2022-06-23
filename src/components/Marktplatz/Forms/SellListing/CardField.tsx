import React from 'react';
import { Field, FieldProps } from 'formik';
import { Card, SelectProps, Typography } from '@mui/material';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import { BeanstalkPalette } from '../../../App/muiTheme';

export type CardFieldProps = {
  title: string;
  value: string;
  setValue: any;
  values: SellListingFormValues;
}

const CardField: React.FC<CardFieldProps & SelectProps> =
  ({
     title,
     value,
     values,
     setValue
   }) => {
    const handleSetFieldValue = () => {
      setValue('card', value);
    };
    return (
      <Field value={value}>
        {(fieldProps: FieldProps) => (
          <Card
            sx={{ cursor: 'pointer', backgroundColor: values.card === value ? BeanstalkPalette.lightishGrey : null }}
            onClick={handleSetFieldValue}
          >
            <Typography>{title}</Typography>
          </Card>
        )}
      </Field>
    );
  };

export default CardField;

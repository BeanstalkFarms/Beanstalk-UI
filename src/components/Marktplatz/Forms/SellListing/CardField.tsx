import React from 'react';
import { Field, FieldProps } from 'formik';
import { Card, SelectProps, Typography } from '@mui/material';
import { SellListingFormValues } from '../../Modals/SellListingModal';
import { BeanstalkPalette } from '../../../App/muiTheme';

export type CardFieldProps = {
  name: string;
  options: ({ title: string; description: string; value: any; })[];
}

const CardField: React.FC<CardFieldProps & SelectProps> = ({
  name,
  options,
}) => {
  // const handleSetFieldValue = () => {
  //   setValue('card', value);
  // };
  return (
    <Field name={name}>
      {(fieldProps: FieldProps) => (
        <div>
          {options.map((opt) => (
            <Card
              key={opt.value}
              sx={{
                cursor: 'pointer',
                backgroundColor: fieldProps.field.value === opt.value ? BeanstalkPalette.lightishGrey : null
              }}
              onClick={() => {
                fieldProps.form.setFieldValue(name, opt.value);
              }}
            >
              <Typography>{opt.title}</Typography>
              <Typography>{opt.description}</Typography>
            </Card>
          ))}
        </div>
        // <Card
        //   sx={{
        //     cursor: 'pointer',
        //     // backgroundColor: values.card === value ? BeanstalkPalette.lightishGrey : null
        //   }}
        //   onClick={handleSetFieldValue}
        // >
        //   <Typography>{title}</Typography>
        // </Card>
      )}
    </Field>
  );
};

export default CardField;

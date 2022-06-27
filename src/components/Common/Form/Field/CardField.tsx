import React from 'react';
import { Field, FieldProps } from 'formik';
import { Card, CardProps, Grid, GridProps, Stack, StackProps, Typography } from '@mui/material';
import { BeanstalkPalette } from '../../../App/muiTheme';

export type CardFieldProps = {
  name: string;
  options: ({ title: string; description: string; value: any; })[];
}

/**
 * -------------
 */
const CardField: React.FC<CardFieldProps & StackProps & CardProps & GridProps> = ({
    name,
    options,
    direction,
    sx,
    xs,
    md,
    spacing
  }) => (
    <Field name={name}>
      {(fieldProps: FieldProps) => (
        <Grid container direction={direction} spacing={spacing}>
          {options.map((opt) => (
            <Grid item xs={xs} md={md}>
              <Card
                key={opt.value}
                sx={{
                px: 1,
                py: 1.5,
                height: '100%',
                cursor: 'pointer',
                border: fieldProps.field.value === opt.value ? 1.5 : 1,
                borderColor: fieldProps.field.value === opt.value ? BeanstalkPalette.logoGreen : BeanstalkPalette.lightBlue,
                '&:hover': {
                  backgroundColor: BeanstalkPalette.hoverBlue
                },
                ...sx
              }}
                onClick={() => {
                fieldProps.form.setFieldValue(name, opt.value);
              }}
            >
                <Stack justifyContent="center" alignItems="center" height="100%">
                  <Typography
                    sx={{
                    textAlign: 'center',
                    fontSize: '16px',
                    color: fieldProps.field.value === opt.value ? BeanstalkPalette.logoGreen : BeanstalkPalette.lightishGrey,
                  }}
                >
                    {opt.title}
                  </Typography>
                  <Typography
                    sx={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: fieldProps.field.value === opt.value ? BeanstalkPalette.logoGreen : BeanstalkPalette.lightishGrey,
                  }}
                >
                    {opt.description}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
        ))}
        </Grid>
    )}
    </Field>
);
export default CardField;

// fieldProps.form.setFieldValue(name, opt.value);

import React from 'react';
import { Field, FieldProps } from 'formik';
import { Card, CardProps, Grid, GridProps, Stack, StackProps, Typography } from '@mui/material';
import { BeanstalkPalette } from '../../App/muiTheme';

export type RadioCardFieldProps = {
  name: string;
  options: ({ 
    title: string;
    description: string;
    value: any;
  })[];
}

const RadioCardField: React.FC<(
  RadioCardFieldProps & 
  StackProps & 
  CardProps & 
  GridProps
)> = ({
  // Form field
  name,
  // Option config
  options,
  // Styling
  direction,
  sx,
  xs = 12,
  md = 6,
  spacing = 1,
}) => {
  return (
    <Field name={name}>
      {(fieldProps: FieldProps) => (
        <Grid container direction={direction} spacing={spacing}>
          {options.map((opt, index) => {
            const selected = fieldProps.field.value === opt.value;
            const color    = selected ? BeanstalkPalette.logoGreen : BeanstalkPalette.lightishGrey
            return (
              <Grid key={index} item xs={xs} md={md}>
                <Card
                  key={opt.value}
                  sx={{
                    px: 1,
                    py: 1.5,
                    height: '100%',
                    cursor: 'pointer',
                    border: selected ? 1 : 1,
                    outline: selected ? `1.5px solid ${BeanstalkPalette.logoGreen}` : 'none',
                    borderColor: selected ? 'transparent' : BeanstalkPalette.lightishGrey,
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
                        color
                      }}
                    >
                      {opt.title}
                    </Typography>
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color
                      }}
                    >
                      {opt.description}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Field>
  );
};

export default RadioCardField;
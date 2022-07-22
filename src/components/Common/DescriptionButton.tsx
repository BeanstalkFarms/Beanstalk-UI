import React from 'react';
import { Button, ButtonProps, Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';

const GAP = 2;

const DescriptionButton : React.FC<ButtonProps & {
  title?: string;
  description?: string;
  icon?: React.ReactNode | string;
  recommended?: boolean;
  selected?: boolean;
}> = ({
  title,
  description,
  recommended,
  selected,
  icon,
  sx,
  ...props
}) => (
  <Button
    variant="outlined"
    color="secondary"
    {...props}
    sx={{
      textAlign: 'left',
      px: GAP,
      py: GAP,
      ...sx,
      // Prevents the button's flex properties from
      // changing the internal layout.
      display: 'block',
      color: 'inherit',
      backgroundColor: selected ? '#F6FAFE' : null,
      '&:hover': {
        backgroundColor: selected ? '#F6FAFE' : null,
      }
      // backgroundColor: selected ? BeanstalkPalette.lightBlue : null,
      // '&:hover': {
      //   backgroundColor: selected ? BeanstalkPalette.lightBlue : null,
      // }
    }}
  >
    <Stack>
      <Stack direction="row" gap={0.5} alignItems="center">
        {icon && (
          <Typography variant="bodyMedium" alignItems="center">
            <Stack alignItems="center">
              {icon}
            </Stack>
          </Typography>
        )}
        <Typography variant="bodyMedium">{title}</Typography>
        {recommended && (
          <Typography variant="bodyMedium" fontWeight="fontWeightBold" sx={{ color: BeanstalkPalette.logoGreen }}>
            (Recommended)
          </Typography>
        )}
      </Stack>
      <Typography variant="bodySmall">
        {description}
      </Typography>
    </Stack>
  </Button>
);

export default DescriptionButton;

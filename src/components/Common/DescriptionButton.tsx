import React from 'react';
import { Box, Button, ButtonProps, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BeanstalkPalette } from '../App/muiTheme';

const GAP = 2;

const DescriptionButton : React.FC<
  ButtonProps
  & {
  title?: string;
  description?: string;
  icon?: React.ReactNode | string;
  recommended?: boolean;
  forceHover?: boolean;
}> = ({
  title,
  description,
  recommended,
  forceHover,
  icon,
  sx,
  ...props
}) => {
  const theme = useTheme();
  return (
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
        backgroundColor: forceHover ? BeanstalkPalette.lightestBlue : null,
        '&:hover': {
          backgroundColor: forceHover ? BeanstalkPalette.lightestBlue : null,
        }
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
        <Typography variant="bodySmall">{description}</Typography>
      </Stack>
    </Button>
  );
};

export default DescriptionButton;

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
      <Stack direction="row" gap={GAP} alignItems="center">
        {icon && (
          <Box width={36}>
            <Typography sx={{ fontSize: 36 }}>
              {icon}
            </Typography>
          </Box>
        )}
        <Box>
          <Stack direction="row" gap={0.3}>
            <Typography variant="h2">{title}</Typography>
            {recommended && (
              <Typography variant="h2" sx={{ color: BeanstalkPalette.logoGreen }}>
                (Recommended)
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" color="gray">{description}</Typography>
        </Box>
      </Stack>
    </Button>
  );
};

export default DescriptionButton;

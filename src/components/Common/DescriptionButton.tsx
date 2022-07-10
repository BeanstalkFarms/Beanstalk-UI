import React from 'react';
import { Box, Button, ButtonProps, Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';

const GAP = 2;

const DescriptionButton : React.FC<ButtonProps & {
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
        <Stack gap={0.25}>
          <Typography variant="h3">
            {title}
            {recommended && (
              <Typography display="inline" color="primary">
                &nbsp;(Recommended)
              </Typography>
            )}
          </Typography>
          <Typography variant="body2" color="gray">
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Button>
  );
};

export default DescriptionButton;

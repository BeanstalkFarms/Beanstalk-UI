import React from 'react';
import { Box, Button, ButtonProps, Stack, Typography } from '@mui/material';

const GAP = 2;

const DescriptionButton : React.FC<ButtonProps & {
  title?: string;
  description?: string;
  icon?: React.ReactNode | string;
}> = ({
  title,
  description,
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
          <Typography variant="h2">{title}</Typography>
          <Typography variant="body2" color="gray">{description}</Typography>
        </Box>
      </Stack>
    </Button>
  );
};

export default DescriptionButton;

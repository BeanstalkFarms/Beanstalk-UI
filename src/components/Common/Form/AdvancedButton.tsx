import React from 'react';
import { Button, ButtonProps, Stack, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';

const AdvancedButton : React.FC<{ 
  open: boolean;
} & ButtonProps> = ({
  open,
  ...props
}) => (
  /// FIXME: make a MUI button variant for this
  <Button
    variant="contained"
    color="light"
    sx={{ backgroundColor: '#F6FAFE' }}
    size="small"
    {...props}
  >
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Typography fontSize="bodySmall">Advanced</Typography>
      <DropdownIcon
        open={open}
        sx={{ fontSize: 18 }}
        mode="right-rotate"
      />
    </Stack>
  </Button>
);

export default AdvancedButton;

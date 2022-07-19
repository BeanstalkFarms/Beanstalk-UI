import React from 'react';
import { Button, Stack, StackProps, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import { IconSize } from '../../App/muiTheme';

const PillRow : React.FC<{
  isOpen: boolean;
  label: string;
  onClick: () => void;
} & StackProps> = ({
  isOpen,
  onClick,
  label,
  children,
  sx,
  ...props
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ ml: 0.5, py: 1, ...sx }}
    {...props}
  >
    <Typography color="gray">
      {label}
    </Typography>
    <Button
      variant="contained"
      onClick={onClick}
      color="light"
      sx={{ px: 0.5 }}
    >
      <Stack direction="row" gap={0.5} alignItems="center">
        {children}
      </Stack>
      <DropdownIcon sx={{ height: IconSize.xs }} open={isOpen} />
    </Button>
  </Stack>
);

export default PillRow;

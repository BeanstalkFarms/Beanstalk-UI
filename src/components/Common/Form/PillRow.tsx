import React from 'react';
import { Button, Stack, StackProps, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import { FontSize, IconSize } from '../../App/muiTheme';

const PillDialogField : React.FC<{
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
    sx={{ ml: 0.5, ...sx }}
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
        // endIcon={}
      >
      <Stack direction="row" gap={0.5} alignItems="center">
        {children}
      </Stack>
      <DropdownIcon sx={{ height: IconSize.xs }} open={isOpen} />
    </Button>
  </Stack>
  );

export default PillDialogField;

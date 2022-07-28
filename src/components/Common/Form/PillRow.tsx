import React from 'react';
import { Button, Stack, StackProps, Tooltip, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import { IconSize } from '../../App/muiTheme';

const PillRow : React.FC<{
  label: string;
  tooltip?: string;
  isOpen: boolean;
  onClick: () => void;
} & StackProps> = ({
  label,
  tooltip = '',
  isOpen,
  onClick,
  children,
  sx,
  ...props
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      ml: 0.5,
      // py: 1,
      ...sx
    }}
    {...props}
  >
    <Tooltip title={tooltip}>
      <Typography color="gray">
        {label}
      </Typography>
    </Tooltip>
    <Button
      variant="contained"
      onClick={onClick}
      color="light"
      sx={{ px: 0.5, height: 'auto' }}
    >
      <Stack direction="row" gap={0.5} alignItems="center">
        {children}
      </Stack>
      <DropdownIcon sx={{ height: IconSize.xs }} open={isOpen} />
    </Button>
  </Stack>
);

export default PillRow;

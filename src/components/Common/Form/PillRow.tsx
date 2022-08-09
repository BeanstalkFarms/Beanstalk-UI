import React from 'react';
import { Button, Stack, StackProps, Tooltip, Typography } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import { IconSize } from '../../App/muiTheme';

const PillRow : React.FC<{
  label: string;
  tooltip?: string;
  isOpen?: boolean;
  onClick: () => void;
  isDropdown?: boolean;
} & StackProps> = ({
  label,
  tooltip = '',
  onClick,
  children,
  sx,
  isDropdown = true,
  isOpen = false,
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
      variant="outlined"
      onClick={onClick}
      color="dark"
      sx={{
        px: 0.75,
        py: 0.5,
        my: 0.5,
        transition: 'none',
        height: 'auto'
      }}
    >
      <Stack direction="row" gap={0.5} alignItems="center">
        {children}
      </Stack>
      {isDropdown && <DropdownIcon sx={{ height: IconSize.xs }} open={isOpen} />}
    </Button>
  </Stack>
);

export default PillRow;

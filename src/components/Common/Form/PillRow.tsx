import React from 'react';
import { Button, StackProps, Tooltip, Typography, TypographyProps } from '@mui/material';
import DropdownIcon from '../DropdownIcon';
import { IconSize } from '../../App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const PillRow : FC<{
  label: string;
  tooltip?: string;
  isOpen?: boolean;
  onClick: () => void;
  isDropdown?: boolean;
  labelProps?: Omit<TypographyProps, 'color'>;
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
  <Row
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
      <Typography color="gray" {...props.labelProps}>
        {label}
      </Typography>
    </Tooltip>
    <Button
      variant="outlined"
      onClick={onClick}
      color="light"
      sx={{
        color: 'text.tertiary',
        px: 0.75,
        py: 0.5,
        my: 0.5,
        transition: 'none',
        height: 'auto',
      }}
    >
      <Row gap={0.5}>
        {children}
      </Row>
      {isDropdown && <DropdownIcon sx={{ height: IconSize.xs }} open={isOpen} />}
    </Button>
  </Row>
);

export default PillRow;

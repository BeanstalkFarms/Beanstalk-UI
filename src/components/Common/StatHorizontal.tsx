import { Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FontSize } from '../App/muiTheme';

const StatHorizontal : React.FC<{
  label: string,
  labelTooltip?: string,
}> = ({
  label,
  labelTooltip = '',
  children
}) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Tooltip title={labelTooltip} placement="right">
      <Typography>
        {label}&nbsp;
        {labelTooltip && (
          <HelpOutlineIcon
            sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
          />
        )}
      </Typography>
    </Tooltip>
    <Stack direction="row" alignItems="center" gap={0.3}>{children}</Stack>
  </Stack>
);

export default StatHorizontal;

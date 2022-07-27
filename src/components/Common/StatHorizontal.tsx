import { Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';

const StatHorizontal : React.FC<{
  label: string,
  labelTooltip?: string,
}> = ({
  label,
  labelTooltip = '',
  children
}) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Tooltip title={labelTooltip} placement="right"><Typography>{label}</Typography></Tooltip>
    <Stack direction="row" alignItems="center" gap={0.3}>{children}</Stack>
  </Stack>
);

export default StatHorizontal;

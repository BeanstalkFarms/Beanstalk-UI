import { Card, Stack, Typography } from '@mui/material';
import React from 'react';

const StatCard : React.FC<{
  title: string;
  icon?: JSX.Element | string;
  amount: string;
}> = ({
  title,
  icon,
  amount,
}) => (
  <Stack gap={1}>
    <Typography color="text.secondary">{title}</Typography>
    <Typography variant="h1" sx={{ marginLeft: '-3px' }}>
      {icon} {amount}
    </Typography>
  </Stack>
);

export default StatCard;

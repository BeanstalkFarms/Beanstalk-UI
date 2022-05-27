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
  children
}) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Stack gap={2} sx={{ height: '100%' }}>
      {/* Title + Statistic */}
      <Stack gap={1}>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h1" sx={{ marginLeft: '-3px' }}>
          {icon} {amount}
        </Typography>
      </Stack>
      {/* Content */}
      {children}
    </Stack>
  </Card>
);

export default StatCard;

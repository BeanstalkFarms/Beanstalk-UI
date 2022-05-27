import { Box, Card, Link, Stack, Typography } from '@mui/material';
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
    <Stack gap={2} justifyContent="space-between">
      {/* Title + Statistic */}
      <Stack gap={1}>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h1">
          {icon} {amount}
        </Typography>
      </Stack>
      {/* Content */}
      <Box>
        {children}
      </Box>
    </Stack>
  </Card>
);

export default StatCard;

import { Card, Stack } from '@mui/material';
import React from 'react';
import Stat, { StatProps } from '../Common/Stat';

import { FC } from '~/types';

const StatCard : FC<StatProps> = ({
  children,
  ...props
}) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Stack gap={2} sx={{ height: '100%' }}>
      {/* Title + Statistic */}
      <Stat {...props} />
      {/* Content */}
      {children}
    </Stack>
  </Card>
);

export default StatCard;

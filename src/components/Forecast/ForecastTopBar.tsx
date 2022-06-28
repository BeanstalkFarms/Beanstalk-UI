import { Card, CardProps, Stack, Typography } from '@mui/material';
import React from 'react';

export type ForecastTopBarProps = {}

const ForecastTopBar: React.FC<ForecastTopBarProps & CardProps> = ({ sx }) => (
  <Card sx={{ width: '100%', p: 1.5, pr: 2, pl: 2, ...sx }}>
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="row" gap={0.5}>
        <Typography>X</Typography>
        <Typography>Next ⏱ Season in 42 min:</Typography>
      </Stack>
      <Stack direction="row" gap={0.5}>
        <Typography>New Beans:</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>790,012</Typography>
      </Stack>
      <Stack direction="row" gap={0.5}>
        <Typography>New Soil:</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>1,200</Typography>
      </Stack>
      <Stack direction="row" gap={0.5}>
        <Typography>Weather:</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>5,000%</Typography>
      </Stack>
    </Stack>
  </Card>
);

export default ForecastTopBar;

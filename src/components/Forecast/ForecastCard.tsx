import React from 'react';
import { Stack, Typography, CardProps, Box, Card } from '@mui/material';

export type ForecastCardProps = {
  stats: React.ReactElement;
  graphSection: React.ReactElement;
  showLastCross?: boolean;
  topRight?: React.ReactElement;
}

const ForecastCard: React.FC<ForecastCardProps & CardProps> = ({ children, topRight, showLastCross, graphSection, stats, sx }) => (
  <Card sx={{ width: '100%' }}>
    <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
      {stats}
      {topRight !== undefined && (
        <Box>
          {topRight}
        </Box>
      )}
    </Stack>
    {graphSection}
  </Card>
);

export default ForecastCard;

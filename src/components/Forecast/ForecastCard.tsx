import React from 'react';
import { Stack, Typography, CardProps, Box, Card } from '@mui/material';

export type ForecastCardProps = {
  stats: React.ReactElement;
  graphSection: React.ReactElement;
  showLastCross?: boolean;
}

const ForecastCard: React.FC<ForecastCardProps & CardProps> = ({ children, showLastCross, graphSection, stats, sx }) => (
  <Card sx={{ width: '100%' }}>
    <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
      {stats}
      {showLastCross && (
        <Box>
          <Typography>Last cross: 2m ago</Typography>
        </Box>
      )}
    </Stack>
    {graphSection}
  </Card>
);

export default ForecastCard;

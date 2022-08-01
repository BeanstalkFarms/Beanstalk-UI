import React from 'react';
import { Card, Grid, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayBN } from '../../util';

export interface ChopConditionsProps {
  test?: string;
  // beanstalkField: AppState['_beanstalk']['field'];
  // farmerField: AppState['_farmer']['field'];
  // podLine: BigNumber;
}

const ChopConditions: React.FC<ChopConditionsProps> = ({
  test
 // beanstalkField,
 // farmerField,
 // podLine,
}) => (
  <Card sx={{ p: 2 }}>
    <Stack gap={1}>
      <Typography variant="h4">Chop Conditions</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <Stack gap={0.5}>
            <Tooltip
              title="The number of Beans that can currently be Sown, or lent to Beanstalk."
              placement="top"
            >
              <Typography variant="body1">Chop Penalty</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(new BigNumber(-1))}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={4}>
          <Stack gap={0.5}>
            <Tooltip title="The interest rate for Sowing Beans." placement="top">
              <Typography variant="body1">Fertilizer Sold</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(new BigNumber(-1))}%
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={4}>
          <Stack gap={0.5}>
            <Tooltip title="The order Pods will become Harvestable based on the FIFO Harvest schedule." placement="top">
              <Typography variant="body1">Debt Repaid to Fertilizer</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(new BigNumber(-1))}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  </Card>
);

export default ChopConditions;

import React from 'react';
import { Card, Grid, Link, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { displayBN } from '../../util';
import { AppState } from '../../state';
import PodLineSection from './PodLineSection';

export interface FieldConditionsProps {
  beanstalkField: AppState['_beanstalk']['field'];
  // farmerField: AppState['_farmer']['field'];
  // podLine: BigNumber;
}

const FieldConditions: React.FC<FieldConditionsProps> = ({
 beanstalkField,
 // farmerField,
 // podLine,
}) => (
  <Card sx={{ p: 2 }}>
    <Stack gap={1}>
      <Typography variant="h4">Field Conditions</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Stack gap={0.5}>
            <Tooltip
              title="The number of Beans that can currently be Sown, or lent to Beanstalk."
              placement="top"
            >
              <Typography variant="body1">Available Soil&nbsp;</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.soil)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The interest rate for Sowing Beans, or lending your Beans to Beanstalk." placement="top">
              <Typography variant="body1">Temperature&nbsp;</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.weather.yield)}%
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The interest rate for Sowing Beans, or lending your Beans to Beanstalk." placement="top">
              <Typography variant="body1">Pod Line&nbsp;</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField?.podIndex.minus(beanstalkField.harvestableIndex))}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The number of Beans that Beanstalk has paid back to Sowers." placement="top">
              <Typography variant="body1">Pods Harvested&nbsp;</Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField?.harvestableIndex)}
            </Typography>
          </Stack>
        </Grid>
        {/* <Grid item xs={12}>
            <PodLineSection
              numPodsTitle="Pod Line"
              numPodsDisplay={podLine}
              podLine={podLine}
              harvestableIndex={beanstalkField.harvestableIndex}
              plots={farmerField.plots}
            />
          </Grid> */}
        {/* <Grid item xs={12}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" gap={0.5}>
                <Tooltip
                  title="This is your total Pod Balance. Pods become Harvestable on a FIFO basis."
                  placement="top">
                  <Typography variant="h4">My Pod Balance:</Typography>
                </Tooltip>
                <Stack direction="row" alignItems="center" gap={0.25}>
                  <img alt="" src={podIcon} height="17px" />
                  <Typography variant="h4">
                    {displayBN(farmerField.pods)}
                  </Typography>
                </Stack>
              </Stack>
              <Link
                onClick={handleOpen}
                underline="none"
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="h4">View My Plots</Typography>
              </Link>
            </Stack>
          </Grid> */}
      </Grid>
    </Stack>
  </Card>
);

export default FieldConditions;

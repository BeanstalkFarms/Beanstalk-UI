import React from 'react';
import { Card, Grid, Stack, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayBN } from '../../util';
import { AppState } from '../../state';
import { FontSize } from '../App/muiTheme';

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
        <Grid item xs={6} md={3}>
          <Stack gap={0.5}>
            <Tooltip
              title="The number of Beans that can currently be Sown, or lent to Beanstalk."
              placement="top"
            >
              <Typography variant="body1">
                Available Soil&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.soil)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The interest rate for Sowing Beans." placement="top">
              <Typography variant="body1">
                Temperature&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.weather.yield)}%
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The order Pods will become Harvestable based on the FIFO Harvest schedule." placement="top">
              <Typography variant="body1">
                Pod Line&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.podLine)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} md={3}>
          <Stack gap={0.5}>
            <Tooltip title="The number of Beans that Beanstalk has paid back to lenders." placement="top">
              <Typography variant="body1">
                Pods Harvested&nbsp;
                <HelpOutlineIcon
                  sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                />
              </Typography>
            </Tooltip>
            <Typography variant="bodyLarge" fontWeight="400">
              {displayBN(beanstalkField.harvestableIndex)}
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

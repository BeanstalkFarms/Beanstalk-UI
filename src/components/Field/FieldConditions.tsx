import React from 'react';
import { Card, Grid, Link, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { displayBN } from '../../util';
import { AppState } from '../../state';
import PodLineSection from './PodLineSection';

export interface FieldConditionsProps {
  podLine: BigNumber;
  beanstalkField: AppState['_beanstalk']['field'];
  farmerField: AppState['_farmer']['field'];
  handleOpenDialog: any;
}

const FieldConditions: React.FC<FieldConditionsProps> =
  ({
     beanstalkField,
     farmerField,
     handleOpenDialog,
     podLine,
   }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleOpen = () => {
      handleOpenDialog();
    };
    return (
      <Card sx={{ p: 2 }}>
        <Stack gap={2}>
          <Typography variant="h2">Field Conditions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Stack gap={0.5}>
                <Typography variant="h4">Available Soil&nbsp;
                  <Tooltip
                    title="The number of Beans that can currently be Sown, or lent to Beanstalk."
                    placement="top">
                    <HelpOutlineIcon
                      sx={{ color: 'text.secondary', fontSize: '14px' }}
                      />
                  </Tooltip>
                </Typography>
                <Typography variant="h1">
                  {displayBN(beanstalkField.soil)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack gap={0.5}>
                <Typography variant="h4">Weather&nbsp;
                  <Tooltip title="The interest rate for Sowing Beans, or lending your Beans to Beanstalk." placement="top">
                    <HelpOutlineIcon
                      sx={{ color: 'text.secondary', fontSize: '14px' }}
                      />
                  </Tooltip>
                </Typography>
                <Typography variant="h1">
                  {displayBN(beanstalkField.weather.yield)}%
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack gap={0.5}>
                <Typography variant="h4">Pods Harvested&nbsp;
                  <Tooltip
                    title="The number of Beans that Beanstalk has paid back to Sowers."
                    placement="top">
                    <HelpOutlineIcon
                      sx={{ color: 'text.secondary', fontSize: '14px' }}
                      />
                  </Tooltip>
                </Typography>
                <Typography variant="h1">
                  {displayBN(beanstalkField?.harvestableIndex)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <PodLineSection
                numPodsTitle="Pod Line"
                numPodsDisplay={podLine}
                podLine={podLine}
                harvestableIndex={beanstalkField.harvestableIndex}
                plots={farmerField.plots}
                />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </Stack>
      </Card>
    );
  };

export default FieldConditions;

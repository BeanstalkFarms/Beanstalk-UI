import React from 'react';
import { Card, CircularProgress, Grid, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN } from '../../util';
import useChopPenalty from '../../hooks/useChopPenalty';
import { NEW_BN } from '../../constants';
import { BeanstalkPalette } from '../App/muiTheme';
import useFertilizerProgress from '../../hooks/useFertilizerProgress';

const ChopConditions: React.FC<{}> = () => {
  const chopPenalty     = useChopPenalty();
  const fertilizerSold  = useFertilizerProgress();
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h4">Chop Conditions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={4}>
            <Stack gap={0.5}>
              <Tooltip
                title="Chop penalty!"
                placement="top"
              >
                <Typography variant="body1" color={BeanstalkPalette.washedRed}>Chop Penalty</Typography>
              </Tooltip>
              {chopPenalty === NEW_BN ? (
                <CircularProgress size={16} thickness={5} sx={{ color: BeanstalkPalette.washedRed }} />
              ) : (
                <Typography variant="bodyLarge" fontWeight="400" color={BeanstalkPalette.washedRed}>
                  {displayBN(chopPenalty)}%
                </Typography>
              )}
            </Stack>
          </Grid>
          <Grid item xs={6} md={4}>
            <Stack gap={0.5}>
              <Tooltip title="Fertilizer sold!" placement="top">
                <Typography variant="body1">Fertilizer Sold</Typography>
              </Tooltip>
              <Typography variant="bodyLarge" fontWeight="400">
                {displayFullBN(fertilizerSold.multipliedBy(100), 2)}%
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={4}>
            <Stack gap={0.5}>
              <Tooltip title="Repaid debt!" placement="top">
                <Typography variant="body1">Debt Repaid to Fertilizer</Typography>
              </Tooltip>
              <Typography variant="bodyLarge" fontWeight="400">
                {/* TODO / FIXME: CALCULATE THIS */}
                {displayBN(new BigNumber(-1))}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default ChopConditions;

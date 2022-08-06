import React from 'react';
import { Card, CircularProgress, Grid, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayBN, displayFullBN } from '../../util';
import useChopPenalty from '../../hooks/useChopPenalty';
import { NEW_BN } from '../../constants';
import { BeanstalkPalette, FontSize } from '../App/muiTheme';
import useFertilizerProgress from '../../hooks/useFertilizerProgress';

const ChopConditions: React.FC<{}> = () => {
  const chopPenalty     = useChopPenalty();
  const fertilizerSold  = useFertilizerProgress();
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h4">Chop Conditions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3.7}>
            <Stack gap={0.5}>
              <Tooltip
                title="The claim to future Ripe assets you are forfeiting by Chopping."
                placement="top"
              >
                <Typography variant="body1" color={BeanstalkPalette.washedRed}>
                  Chop Penalty&nbsp;
                  <HelpOutlineIcon
                    sx={{ color: BeanstalkPalette.washedRed, fontSize: FontSize.sm }}
                  />
                </Typography>
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
          <Grid item xs={6} md={3.7}>
            <Stack gap={0.5}>
              <Tooltip title="As the percentage of Fertilizer sold increases, the Chop Penalty decreases." placement="top">
                <Typography variant="body1">
                  Fertilizer Sold&nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                  />
                </Typography>
              </Tooltip>
              <Typography variant="bodyLarge" fontWeight="400">
                {displayFullBN(fertilizerSold.multipliedBy(100), 2)}%
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={4.6}>
            <Stack gap={0.5}>
              <Tooltip title="In Beanstalk terms, this is the percentage of Sprouts that have become Rinsable." placement="top">
                <Typography variant="body1">
                  Debt Repaid to Fertilizer&nbsp;
                  <HelpOutlineIcon
                    sx={{ color: 'text.secondary', fontSize: FontSize.sm }}
                  />
                </Typography>
              </Tooltip>
              <Typography variant="bodyLarge" fontWeight="400">
                {/* TODO / FIXME: CALCULATE THIS */}
                {displayBN(new BigNumber(-1))}%
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default ChopConditions;

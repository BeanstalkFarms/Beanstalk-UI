import React from 'react';
import { Stack, Typography, Box, Grid } from '@mui/material';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BigNumber from 'bignumber.js';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import { displayBN } from '../../util';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';

export interface SeasonCardProps {
  season: BigNumber;
  newBeans: BigNumber;
  newSoil: BigNumber;
  temperature: BigNumber;
  podRate: BigNumber;
  deltaDemand: BigNumber;
  // deltaWeather: BigNumber;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, newBeans, newSoil, podRate, temperature, deltaDemand }) => (
  <Box
    sx={{
    border: 1,
    borderColor: BeanstalkPalette.blue,
    p: 0.75,
    borderRadius: '8px',
  }}
>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Grid container>
        <Grid item xs={1.5} md={1.25}>
          <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing="5px">
            {newBeans.gt(new BigNumber(0)) ? (
              <img src={drySeasonIcon} height={IconSize.small} alt="" />
          ) : (
            <img src={rainySeasonIcon} height={IconSize.small} alt="" />
          )}
            <Typography color="text.primary" variant="bodySmall">
              {displayBN(season)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={3} md={2}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography color="gray" variant="bodySmall">
              {displayBN(newBeans)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={3} md={2}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            {newSoil.gt(new BigNumber(0)) ? (
              <ArrowUpwardIcon
                sx={{
                width: '14px',
                height: '14px',
                color: BeanstalkPalette.logoGreen,
              }}
            />
          ) : null}
            <Typography
              color={
              newSoil.gt(new BigNumber(0))
                ? BeanstalkPalette.logoGreen
                : BeanstalkPalette.lightishGrey
            }
              variant="bodySmall"
          >
              {displayBN(newSoil)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={4.5} md={2.75}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
            <Typography variant="bodySmall">
              {displayBN(temperature)}
            </Typography>
            <Typography
              variant="bodySmall"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="end"
              sx={{
              color: newSoil.gt(new BigNumber(0))
                ? BeanstalkPalette.logoGreen
                : BeanstalkPalette.lightishGrey,
              whiteSpace: 'nowrap',
            }}
          >
              (
              {newSoil.gt(new BigNumber(0)) ? (
                <ArrowUpwardIcon
                  sx={{
                  width: '14px',
                  height: '14px',
                  color: BeanstalkPalette.logoGreen,
                }}
              />
            ) : (
              <ArrowDownwardIcon
                sx={{
                  width: '14px',
                  height: '14px',
                  color: BeanstalkPalette.lightishGrey,
                }}
              />
            )}
              {temperature.div(10).toFixed(0)}% )
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography color="text.primary" variant="bodySmall">
              {displayBN(podRate)}%
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography
              variant="bodySmall"
              sx={{
              color: deltaDemand.gte(new BigNumber(100))
                ? BeanstalkPalette.logoGreen
                : BeanstalkPalette.washedRed,
            }}
          >
              {displayBN(deltaDemand)}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  </Box>
);

export default SeasonCard;

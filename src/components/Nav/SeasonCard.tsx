import React from 'react';
import { Stack, Typography, Box, Grid } from '@mui/material';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import BigNumber from 'bignumber.js';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import { ZERO_BN } from 'constants/index';
import { displayBN } from '../../util';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';

export interface SeasonCardProps {
  season:       BigNumber;
  twap:         BigNumber;
  newBeans:     BigNumber;
  newSoil:      BigNumber;
  temperature:  BigNumber;
  deltaTemperature: BigNumber;
  podRate:      BigNumber;
  deltaDemand:  BigNumber;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, twap, newBeans, newSoil, podRate, temperature, deltaDemand, deltaTemperature: deltaWeather }) => (
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
            {(twap.lte(1)) ? (
              <img src={drySeasonIcon} height={IconSize.small} alt="" />
            ) : (
              <img src={rainySeasonIcon} height={IconSize.small} alt="" />
            )}
            <Typography color="text.primary" variant="bodySmall">
              {season?.toString() || '?'}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={3} md={2}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography variant="bodySmall">
              {newBeans ? `+ ${displayBN(newBeans)}` : '?'}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={3} md={2}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            {/* {newSoil?.gt(0) ? (
              <ArrowUpwardIcon
                sx={{
                  width: '14px',
                  height: '14px',
                  color: BeanstalkPalette.logoGreen,
                }}
              />
            ) : null} */}
            <Typography
              variant="bodySmall"
            >
              + {displayBN(newSoil)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={4.5} md={2.75}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
            <Typography variant="bodySmall">
              {temperature ? `${temperature.toString()}%` : '?'}
            </Typography>
            <Typography
              variant="bodySmall"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="end"
              sx={{
                color: 'gray',
                // color: deltaWeather.gt(0)
                //   ? BeanstalkPalette.logoGreen
                //   : BeanstalkPalette.lightishGrey,
                whiteSpace: 'nowrap',
              }}
            >
              (&nbsp;
              {/* {deltaWeather.gt(0) ? (
                '+'
                // <ArrowUpwardIcon
                //   sx={{
                //     width: '14px',
                //     height: '14px',
                //     color: BeanstalkPalette.logoGreen,
                //   }}
                // />
              ) : (
                '-'
                // <ArrowDownwardIcon
                //   sx={{
                //     width: '14px',
                //     height: '14px',
                //     color: BeanstalkPalette.lightishGrey,
                //   }}
                // />
              )} */}
              {deltaWeather.toString()}%&nbsp;)
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography color="text.primary" variant="bodySmall">
              {displayBN(podRate?.times(100))}%
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
          <Stack alignItems="flex-end" justifyContent="center">
            <Typography
              variant="bodySmall"
              sx={{
                // color: deltaDemand?.gte(new BigNumber(100))
                //   ? BeanstalkPalette.logoGreen
                //   : BeanstalkPalette.washedRed,
              }}
            >
              {displayBN(deltaDemand || ZERO_BN)}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  </Box>
);

export default SeasonCard;

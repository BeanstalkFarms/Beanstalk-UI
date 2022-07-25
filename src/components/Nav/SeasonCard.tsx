import React from 'react';
import { Stack, Typography, Box, Grid } from '@mui/material';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from '../App/muiTheme';
import { displayBN } from '../../util';

export interface SeasonCardProps {
  season: BigNumber;
  newBeans: BigNumber;
  newSoil: BigNumber;
  weather: BigNumber;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, newBeans, newSoil, weather }) => (
  <Box sx={{ border: 1, borderColor: BeanstalkPalette.lightBlue, p: 0.75, borderRadius: '8px' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Grid container alignItems="flex-end">
        <Grid item md={2} xs={2.5}>
          <Typography color="text.primary" variant="bodySmall">{displayBN(season)}</Typography>
        </Grid>
        <Grid item md={2.6} xs={0} display={{ xs: 'none', md: 'block' }}>
          <Stack direction="row" alignItems="center" spacing="2px">
            <img
              src={rainySeasonIcon}
              style={{ width: 16, height: 16 }}
              alt="dry/rainy season"
            />
            <Typography
              color="text.primary"
              sx={{ fontSize: '14px', fontWeight: 500 }}
            >
              Rainy
            </Typography>
          </Stack>
        </Grid>
        <Grid item md={2.6} xs={3} display={{ md: 'block' }}>
          {newBeans.gt(new BigNumber(0)) ? (
            <Stack direction="row" alignItems="center">
              <ArrowUpwardIcon sx={{ width: '14px', height: '14px', color: BeanstalkPalette.logoGreen }} />
              <Typography
                color={BeanstalkPalette.logoGreen}
                variant="bodySmall"
              >
                {displayBN(newBeans)}
              </Typography>
            </Stack>
          ) : (
            <Typography
              color={BeanstalkPalette.lightishGrey}
              variant="bodySmall"
            >
              {displayBN(newBeans)}
            </Typography>
          )}
        </Grid>
        <Grid item md={2.4} xs={3} display={{ md: 'block' }}>
          {newSoil.gt(new BigNumber(0)) ? (
            <Stack direction="row" alignItems="center">
              <ArrowUpwardIcon sx={{ width: '14px', height: '14px', color: BeanstalkPalette.logoGreen }} />
              <Typography
                color={BeanstalkPalette.logoGreen}
                variant="bodySmall"
              >
                {displayBN(newSoil)}
              </Typography>
            </Stack>
          ) : (
            <Typography
              color={BeanstalkPalette.lightishGrey}
              variant="bodySmall"
            >
              {displayBN(newSoil)}
            </Typography>
          )}
        </Grid>
        <Grid item md={2.4} xs={3.5} sx={{ textAlign: 'right' }}>
          <Typography color="text.primary" variant="bodySmall" display="flex" flexDirection="row" alignItems="center" justifyContent="end">
            {displayBN(weather)} (<ArrowDownwardIcon sx={{ width: '14px', height: '14px', display: 'inline' }} />3%)
          </Typography>
        </Grid>
      </Grid>
    </Stack>
  </Box>
);

export default SeasonCard;

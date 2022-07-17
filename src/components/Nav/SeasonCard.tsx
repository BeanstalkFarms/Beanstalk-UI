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

const SeasonCard: React.FC<SeasonCardProps> = ({
  season,
  newBeans,
  newSoil,
  weather,
}) => (
  <Box
    sx={{
      border: 1,
      borderColor: BeanstalkPalette.lightBlue,
      p: 0.75,
      borderRadius: '8px',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Grid container alignItems="flex-end">
        <Grid item md={2} xs={4}>
          <Typography color="text.primary" sx={{ fontSize: '14px' }}>
            {displayBN(season)}
          </Typography>
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
        <Grid item md={2.6} xs={0} display={{ xs: 'none', md: 'block' }}>
          <Typography color="text.primary" sx={{ fontSize: '14px' }}>
            {displayBN(newBeans)}
          </Typography>
        </Grid>
        <Grid item md={2.4} xs={0} display={{ xs: 'none', md: 'block' }}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{ width: '20%', alignSelf: 'flex-start' }}
          >
            <ArrowUpwardIcon sx={{ width: '14px', height: '14px' }} />
            <Typography
              color="text.primary"
              sx={{
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {displayBN(newSoil)}
            </Typography>
          </Stack>
        </Grid>
        <Grid item md={2.4} xs={8} sx={{ textAlign: 'right' }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing="6px"
            sx={{ width: '20%', alignSelf: 'flex-end' }}
          >
            <Typography
              color="text.primary"
              sx={{
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {displayBN(weather)}
            </Typography>
            <Stack direction="row" alignItems="center">
              <Typography
                color="text.primary"
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                (
              </Typography>
              <ArrowDownwardIcon sx={{ width: '14px', height: '14px' }} />
              <Typography
                color="text.primary"
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                3%)
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  </Box>
);

export default SeasonCard;

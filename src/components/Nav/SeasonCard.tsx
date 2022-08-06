import React from 'react';
import { Stack, Typography, Box, Grid } from '@mui/material';
import BigNumber from 'bignumber.js';
import rainySeasonIcon from '~/img/beanstalk/sun/rainy-season.svg';
import drySeasonIcon from '~/img/beanstalk/sun/dry-season.svg';
import { displayBN } from '../../util';
import { BeanstalkPalette, FontSize, IconSize } from '../App/muiTheme';

export interface SeasonCardProps {
  season:       BigNumber;
  twap:         BigNumber;
  newBeans:     BigNumber;
  newSoil:      BigNumber;
  temperature:  BigNumber;
  deltaTemperature: BigNumber;
  podRate:      BigNumber;
  deltaDemand:  BigNumber;
  isNew?: boolean;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, twap, newBeans, newSoil, podRate, temperature, deltaDemand, deltaTemperature: deltaWeather, isNew }) => (
  <div>
    <Box sx={{ '&:hover > .test': { display: 'block' }, overflow: 'hidden', position: 'relative' }}>
      {isNew && (
        <Box
          className="test"
          sx={{ 
            borderColor: 'rgba(240, 223, 146, 1)',
            borderWidth: 1,
            borderStyle: 'solid',
            display: 'none',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" height="100%">
            <Typography pl={1} color="gray" fontSize={FontSize.sm} textAlign="left">
              The forecast for Season {season.toString()} is based on data in the current Season.
            </Typography>
          </Stack>
        </Box>
      )}
      <Box
        sx={{
          border: 1,
          borderColor: BeanstalkPalette.blue,
          p: 0.75,
          borderRadius: '8px',
          animation: isNew ? 'pulse 1s ease-in-out' : undefined,
          animationIterationCount: 'infinite',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Grid container columns={10}>
            {/* Season */}
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
            {/* New Beans */}
            <Grid item xs={3} md={2}>
              <Stack alignItems="flex-end" justifyContent="center">
                <Typography variant="bodySmall">
                  {newBeans ? `+ ${displayBN(newBeans)}` : '?'}
                </Typography>
              </Stack>
            </Grid>
            {/* New Soil */}
            <Grid item xs={3} md={2}>
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Typography
                  variant="bodySmall"
                >
                  {!isNew && '+'} {displayBN(newSoil)}
                </Typography>
              </Stack>
            </Grid>
            {/* Temperature */}
            <Grid item xs={4.5} md={2.75}>
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                <Typography variant="bodySmall">
                  {temperature ? `${displayBN(temperature)}%` : '?'}
                </Typography>
                <Typography
                  variant="bodySmall"
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="end"
                  sx={{
                    color: 'gray',
                    whiteSpace: 'nowrap',
                  }}
                >
                  (&nbsp;{deltaWeather.toString()}%&nbsp;)
                </Typography>
              </Stack>
            </Grid>
            {/* Pod Rate */}
            <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
              <Stack alignItems="flex-end" justifyContent="center">
                <Typography color="text.primary" variant="bodySmall">
                  {podRate?.gt(0) ? `${displayBN(podRate.times(100))}%` : '-'}
                </Typography>
              </Stack>
            </Grid>
            {/* Delta Demand */}
            {/* <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }}>
              <Stack alignItems="flex-end" justifyContent="center">
                <Typography variant="bodySmall">
                  {displayBN(deltaDemand || ZERO_BN)}
                </Typography>
              </Stack>
            </Grid> */}
          </Grid>
        </Stack>
      </Box>
    </Box>
  </div>
);

export default SeasonCard;

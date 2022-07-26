import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import rainySeasonIcon from 'img/beanstalk/sun/rainy-season.svg';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BigNumber from 'bignumber.js';
import drySeasonIcon from 'img/beanstalk/sun/dry-season.svg';
import { BeanstalkPalette } from '../App/muiTheme';
import { displayBN } from '../../util';
import { useSeasonTableStyles } from './utils';

export interface SeasonCardProps {
  season: BigNumber;
  newBeans: BigNumber;
  newSoil: BigNumber;
  temperature: BigNumber;
  podRate: BigNumber;
  deltaDemand: BigNumber;
}

const SeasonCard: React.FC<SeasonCardProps> = ({
  season,
  newBeans,
  newSoil,
  temperature,
  podRate,
  deltaDemand,
}) => {
  const styles = useSeasonTableStyles();

  return (
    <Box
      sx={{
        border: 1,
        borderColor: BeanstalkPalette.blue,
        p: 0.75,
        borderRadius: '8px',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack justifyContent="space-between" direction="row" width="100%">
          <Stack sx={styles.season}>
            <Stack direction="row" alignItems="center" spacing="5px">
              {newBeans.gt(new BigNumber(0)) ? (
                <img
                  src={drySeasonIcon}
                  style={{ width: 16, height: 16 }}
                  alt="dry/rainy season"
                />
              ) : (
                <img
                  src={rainySeasonIcon}
                  style={{ width: 16, height: 16 }}
                  alt="dry/rainy season"
                />
              )}
              <Typography color="text.primary" variant="bodySmall">
                {displayBN(season)}
              </Typography>
            </Stack>
          </Stack>

          <Stack sx={styles.newBeans}>
            <Stack>
              <Typography color="gray" variant="bodySmall">
                {displayBN(newBeans)}
              </Typography>
            </Stack>
          </Stack>
          <Stack sx={styles.newSoil}>
            <Stack direction="row" alignItems="center">
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
          </Stack>
          <Stack sx={styles.temperature}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
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
          </Stack>
          <Stack sx={styles.podRate}>
            <Typography color="text.primary" variant="bodySmall">
              {displayBN(podRate)}%
            </Typography>
          </Stack>
          <Stack sx={styles.deltaDemand}>
            <Typography
              variant="bodySmall"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="end"
              sx={{
                color: deltaDemand.gte(new BigNumber(100))
                  ? BeanstalkPalette.logoGreen
                  : BeanstalkPalette.washedRed,
              }}
            >
              {displayBN(deltaDemand)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SeasonCard;

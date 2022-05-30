import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Card, Link, Stack, Typography } from '@mui/material';
import { displayFullBN } from 'util/index';
import useHumidity, { INITIAL_HUMIDITY } from 'hooks/useHumidity';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import FertilizerImage from './FertilizerImage';

const RemainingFertilizer: React.FC = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>(
    (state) => state._beanstalk.sun.sunrise.remaining
  );
  const nextDecreaseTimeString = humidity.eq(INITIAL_HUMIDITY) ? 'in early July' : `in ${nextDecreaseDuration.toFormat('mm:ss')}`;
  const progress = fertilizer.totalRaised.gt(0) 
    ? fertilizer.totalRaised.div(fertilizer.totalRaised.plus(fertilizer.remaining))
    : new BigNumber(0);
  
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={2}>
        <Typography variant="h2">Remaining Fertilizer</Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'left',  md: 'center' }}
          justifyContent={{ md: 'left' }}
          gap={2}
        >
          {/* left column */}
          <Box sx={{ minWidth: 200, display: { xs: 'none', md: 'block' } }}>
            <FertilizerImage progress={Math.max(progress.toNumber(), 0.05)} />
          </Box>
          {/* right column */}
          <Stack justifyContent="space-between" gap={3}>
            <Stack gap={3}>
              <Stack gap={1}>
                <Typography color="text.secondary">Available Unused Fertilizer</Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography display="inline-block" variant="h1" sx={{ fontWeight: 400 }}>
                    {displayFullBN(fertilizer.remaining, 0)}&nbsp;
                  </Typography>
                  {progress.gt(0) ? (
                    <Typography display="inline-block" variant="body1" color="text.secondary">
                      {displayFullBN(progress.multipliedBy(100), 2)}% Filled
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Typography sx={{ opacity: 0.7 }}>Current Humidity (Interest Rate)</Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography sx={{ fontSize: '25px', fontWeight: 400 }}>
                    {displayFullBN(humidity.multipliedBy(100))}%
                  </Typography>
                  <Typography sx={{ color: '#c35f42' }}>
                    {nextDecreaseAmount.eq(0)
                      ? null
                      : displayFullBN(nextDecreaseAmount.multipliedBy(-100))}% {nextDecreaseTimeString}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack>
              <Link
                href="#"
                rel="noreferrer"
                color="text.secondary"
                >
                <Typography variant="body1">
                  Learn more about the Barn Raise
                </Typography>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default RemainingFertilizer;

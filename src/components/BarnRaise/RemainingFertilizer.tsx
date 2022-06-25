import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Card, Link, Stack, Typography, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { displayFullBN } from 'util/index';
import useHumidity, { INITIAL_HUMIDITY } from 'hooks/useHumidity';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import FertilizerImage from './FertilizerImage';

const RemainingFertilizer: React.FC = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const fertilizer = useSelector<
    AppState,
    AppState['_beanstalk']['fertilizer']
  >((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<
    AppState,
    AppState['_beanstalk']['sun']['sunrise']['remaining']
  >((state) => state._beanstalk.sun.sunrise.remaining);
  const nextDecreaseTimeString = humidity.eq(INITIAL_HUMIDITY)
    ? 'when Beanstalk is Replanted'
    : `in ${nextDecreaseDuration.toFormat('mm:ss')}`;
  const progress = fertilizer.totalRaised.gt(0)
    ? fertilizer.totalRaised.div(
        fertilizer.totalRaised.plus(fertilizer.remaining)
      )
    : new BigNumber(0);

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={2}>
        <Typography variant="h2">Remaining Fertilizer</Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'left', md: 'center' }}
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
                <Typography>Available Fertilizer&nbsp;
                  <Tooltip title="Once bought, Fertilizer will receive a pro rata share of one-third of new Bean mints until the Humidity, or interest rate, is paid back." placement="top-start">
                    <HelpOutlineIcon
                      sx={{ color: 'text.secondary', fontSize: '14px' }}
                    />
                  </Tooltip>
                </Typography>
                <Stack direction="row" gap={1} alignItems="center">
                  <Typography
                    display="inline-block"
                    variant="h1"
                    sx={{ fontWeight: 400 }}
                  >
                    {displayFullBN(fertilizer.remaining, 0)}&nbsp;
                  </Typography>
                  {progress.gt(0) ? (
                    <Typography
                      display="inline-block"
                      variant="body1"
                      color="text.secondary"
                    >
                      {displayFullBN(progress.multipliedBy(100), 2)}% Purchased
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Typography>Humidity&nbsp;
                  <Tooltip title="The interest rate on Fertilizer. Humidity will decrease to 250% once Beanstalk is Replanted, and decrease 0.5% every Season until 20% Humidity is reached." placement="top-start">
                    <HelpOutlineIcon
                      sx={{ color: 'text.secondary', fontSize: '14px' }}
                    />
                  </Tooltip>
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography sx={{ fontSize: '25px', fontWeight: 400 }}>
                    {displayFullBN(humidity.multipliedBy(100))}%
                  </Typography>
                  <Typography sx={{ color: '#c35f42' }}>
                    {nextDecreaseAmount.eq(0)
                      ? null
                      : displayFullBN(nextDecreaseAmount.multipliedBy(-100))}
                    % {nextDecreaseTimeString}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack>
              <Link
                href="https://bean.money/blog/a-farmers-guide-to-the-barn-raise"
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

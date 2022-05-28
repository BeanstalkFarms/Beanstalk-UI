import React from 'react';
import { Box, Card, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/index';
import FertilizerImage from '../FertilizerImage';

const RemainingFertilizer: React.FC<{
  remaining: BigNumber;
  humidity: BigNumber;
  nextDecreaseAmount: BigNumber;
  nextDecreaseTimeString: string;
}> = (props) => (
  <Card sx={{ p: 2 }}>
    <Stack gap={1}>
      <Typography variant="h2">Remaining Fertilizer</Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent={{ md: 'left' }}
        gap={2}
      >
        {/* left column */}
        <Box sx={{ minWidth: 200 }}>
          <FertilizerImage progress={0.5} />
        </Box>
        {/* right column */}
        <Stack sx={{ p: 1 }} justifyContent="space-between" gap={3}>
          <Stack gap={3}>
            <Stack gap={1}>
              <Typography color="text.secondary">Available Unused Fertilizer</Typography>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography display="inline-block" variant="h1" sx={{ fontWeight: 400 }}>
                  {displayFullBN(props.remaining)}&nbsp;
                </Typography>
                <Typography display="inline-block" variant="body1" color="text.secondary">
                  15%
                </Typography>
              </Stack>
            </Stack>
            <Stack gap={1}>
              <Typography sx={{ opacity: 0.7 }}>Current Humidity (Interest Rate)</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography sx={{ fontSize: '25px', fontWeight: 400 }}>
                  {displayFullBN(props.humidity.multipliedBy(100))}%
                </Typography>
                <Typography sx={{ color: '#c35f42' }}>
                  {props.nextDecreaseAmount.eq(0)
                      ? null
                      : displayFullBN(props.nextDecreaseAmount.multipliedBy(-100))}% {props.nextDecreaseTimeString}
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

export default RemainingFertilizer;

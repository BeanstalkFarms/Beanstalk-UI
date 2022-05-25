import React from 'react';
import { Card, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import fertilizerClosedIcon from 'img/fertilizer-closed.svg';
import { displayFullBN } from '../../../../util';
// import { AppState } from 'state';

const RemainingFertilizer: React.FC<{
  remaining: BigNumber;
  humidity: BigNumber;
  nextDecreaseAmount: BigNumber;
  nextDecreaseTimeString: string;
  // season: AppState['_beanstalk']['sun']['season'];
  // nextDecreaseDuration: AppState['_beanstalk']['sun']['sunrise']['remaining'];
  // nextSunrise: AppState['_beanstalk']['sun']['sunrise']['next'];
}> = (props) => (
  <Card sx={{ p: 2 }}>
    <Stack gap={1}>
      <Typography variant="h6">Remaining Fertilizer</Typography>
      <Stack direction="row" justifyContent="center" gap={4}>
        {/* left column */}
        <Stack>
          <img alt="" src={fertilizerClosedIcon} />
        </Stack>
        {/* right column */}
        <Stack sx={{ p: 1 }} justifyContent="space-between">
          <Stack gap={3}>
            <Stack gap={1}>
              <Typography sx={{ opacity: 0.7 }}>Available Unused Fertilizer</Typography>
              <Typography sx={{ fontSize: '25px', fontWeight: 400 }}>
                {displayFullBN(props.remaining)}
              </Typography>
            </Stack>
            <Stack gap={1}>
              <Typography sx={{ opacity: 0.7 }}>Current Humidity (Interest Rate)</Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography sx={{ fontSize: '25px', fontWeight: 400 }}>
                  {displayFullBN(props.humidity)}%
                </Typography>
                <Typography sx={{ color: '#c35f42' }}>
                  {props.nextDecreaseAmount.eq(0)
                    ? null 
                    : displayFullBN(props.nextDecreaseAmount)}% {props.nextDecreaseTimeString}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack>
            <Link
              href="#"
              rel="noreferrer"
              >
              <Typography variant="body1">
                Learn More About The Barn Raise
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  </Card>
  );

export default RemainingFertilizer;

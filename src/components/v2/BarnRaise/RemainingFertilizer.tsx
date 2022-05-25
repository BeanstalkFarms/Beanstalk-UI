import React from 'react';
import { Card, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import fertilizerClosedIcon from 'img/fertilizer-closed.svg';
import { AppState } from 'state';
import { displayFullBN } from '../../../util';

const RemainingFertilizer: React.FC<{
  remaining: BigNumber;
  humidity: BigNumber;
  // season: AppState['_beanstalk']['sun']['season'];
  sunrise: AppState['_beanstalk']['sun']['sunrise'];
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
                  {displayFullBN(new BigNumber(-250))}% in {props.sunrise.remaining.toISO()}
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

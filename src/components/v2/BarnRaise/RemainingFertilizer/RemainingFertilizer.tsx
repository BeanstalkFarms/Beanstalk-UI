import React, { useEffect } from 'react';
import { Card, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import BigNumber from 'bignumber.js';
import fertilizerClosedIcon from 'img/fertilizer-closed.svg';
import { displayFullBN } from '../../../../util';
import muiTheme from '../../App/muiTheme';

const RemainingFertilizer: React.FC<{
  remaining: BigNumber;
  humidity: BigNumber;
  nextDecreaseAmount: BigNumber;
  nextDecreaseTimeString: string;
  // season: AppState['_beanstalk']['sun']['season'];
  // nextDecreaseDuration: AppState['_beanstalk']['sun']['sunrise']['remaining'];
  // nextSunrise: AppState['_beanstalk']['sun']['sunrise']['next'];
}> = (props) => {
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  useEffect(() => {
    console.log(isSmallScreen);
  }, [isSmallScreen]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1}>
        <Typography variant="h6">Remaining Fertilizer</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'unset' }} justifyContent={{ md: 'left' }} gap={2}>
          {/* left column */}
          <Stack
            sx={{
              ml: (isSmallScreen) ? 0 : 3
            }}
          >
            <img alt="" src={fertilizerClosedIcon} width="300px" />
          </Stack>
          {/* right column */}
          <Stack sx={{ p: 1 }} justifyContent="space-between" gap={3}>
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
};

export default RemainingFertilizer;

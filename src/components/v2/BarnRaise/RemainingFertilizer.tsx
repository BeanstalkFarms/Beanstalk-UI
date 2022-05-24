import React from 'react';
import { Box, Card, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../../util';
import fertilizerClosedIcon from 'img/fertilizer-closed.svg';

const RemainingFertilizer: React.FC = () => {
    return (
      <Card sx={{ p: 2 }}>
        <Stack gap={1}>
          <Typography variant="h6">Remaining Fertilizer</Typography>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            {/* left column */}
            <Stack sx={{ p: 1 }} justifyContent="space-between">
              <Stack gap={3}>
                <Stack gap={1}>
                  <Typography sx={{ opacity: 0.7 }}>Available Unused Fertilizer</Typography>
                  <Typography
                    sx={{ fontSize: '25px', fontWeight: 400 }}>{displayFullBN(new BigNumber(77000000))}
                  </Typography>
                </Stack>
                <Stack gap={1}>
                  <Typography sx={{ opacity: 0.7 }}>Current Humidity (Interest Rate)</Typography>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography
                      sx={{ fontSize: '25px', fontWeight: 400 }}>{displayFullBN(new BigNumber(500))}%
                    </Typography>
                    <Typography sx={{ color: '#c35f42' }}>{displayFullBN(new BigNumber(-250))}% in
                      13:24:43:12
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
            {/* right column */}
            <Stack>
              <img alt="" src={fertilizerClosedIcon} />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    );
  };

export default RemainingFertilizer;

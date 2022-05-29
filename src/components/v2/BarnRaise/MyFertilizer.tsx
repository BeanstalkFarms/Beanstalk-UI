import React, { useMemo } from 'react';
import { Box, Card, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useHumidityAtSeason } from 'hooks/useHumidity';
import { AppState } from 'state';
import FertilizerItem from 'components/v2/BarnRaise/FertilizerItem';
import { zeroBN } from 'constants/index';

const MyFertilizer : React.FC = () => {
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
  const humidityAt = useHumidityAtSeason();
  const tokenIds = useMemo(() => Object.keys(farmerFertilizer.tokens), [farmerFertilizer.tokens]);
  return (
    <Card>
      {/* Card Header */}
      <Stack sx={{ p: 2 }} gap={1}>
        <Typography variant="h6">My Active Fertilizer</Typography>
        <Stack gap={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Unclaimed Beans:</Typography>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Stack direction="row" gap={0.2}>
                {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
                <Typography>200</Typography>
              </Stack>
              <Link underline="none" href="#"><Typography>(Claim)</Typography></Link>
              <Typography>or</Typography>
              <Link underline="none" href="#"><Typography>(Claim & Deposit)</Typography></Link>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Total Fertilizer Reward:</Typography>
            <Stack direction="row" alignItems="center" gap={0.1}>
              {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
              <Typography>100,000</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Total Owed Beans:</Typography>
            <Stack direction="row" alignItems="center" gap={0.1}>
              {/* <img alt="" src={beanCircleIcon} width="16px"/> */}
              <Typography>100,000</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      {/* Fertilizers */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {tokenIds.length > 0 ? (
            tokenIds.map((id) => {
              const season = new BigNumber(id);
              const [humidity] = humidityAt(season);
              const amount = farmerFertilizer.tokens[id];
              const remaining = amount.multipliedBy(humidity.plus(1));
              return (
                <Grid key={id} item xs={6} md={3}>
                  <FertilizerItem
                    state="active"
                    humidity={humidity}
                    remaining={remaining}
                    amount={amount}
                  />
                </Grid>
              );
            })
          ) : (
            <>
              <Grid item xs={6} md={3}>
                <FertilizerItem
                  state="unused"
                  amount={zeroBN}
                  humidity={zeroBN}
                  remaining={zeroBN}
                />
              </Grid>
              <Grid item xs={10}>
                <Typography textAlign="center">
                  Purchase Available Fertilizer using the module above to receive interest at the specified Humidity in the form of future Bean Mints.
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Card>
  );
};

export default MyFertilizer;

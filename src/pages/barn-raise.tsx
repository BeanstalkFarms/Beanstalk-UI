import React, { useMemo } from 'react';
import { Box, Card, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import useHumidity, { INITIAL_HUMIDITY, useHumidityAtSeason } from 'hooks/useHumidity';
import { ERC20_TOKENS } from 'constants/v2/tokens';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import Form from 'components/v2/BarnRaise/Form';
import RemainingFertilizer from 'components/v2/BarnRaise/RemainingFertilizer/RemainingFertilizer';
import FertilizerItem from 'components/v2/BarnRaise/FertilizerItem';
import { zeroBN } from 'constants/index';

const WrappedRemainingFertilizer = () => {
  const [humidity, nextDecreaseAmount] = useHumidity();
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['fertilizer']>((state) => state._beanstalk.fertilizer);
  const nextDecreaseDuration = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']['remaining']>(
    (state) => state._beanstalk.sun.sunrise.remaining
  );
  return (
    <RemainingFertilizer
      remaining={fertilizer.remaining}
      nextDecreaseAmount={nextDecreaseAmount}
      // FIXME:
      //  Below "in early July" is hardcoded.
      //  Also hardcoded in getNextExpectedSunrise().
      nextDecreaseTimeString={humidity.eq(INITIAL_HUMIDITY) ? 'in early July' : `in ${nextDecreaseDuration.toFormat('mm:ss')}`}
      humidity={humidity}
    />
  );
};

const MyFertilizer = () => {
  const farmerFert = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer);
  const humidityAt = useHumidityAtSeason();
  const tokenIds = useMemo(() => Object.keys(farmerFert.tokens), [farmerFert.tokens]);
  
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
              const amount = farmerFert.tokens[id];
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

const BarnRaisePage: React.FC = () => {
  const erc20TokenList = useTokenMap(ERC20_TOKENS); // TODO: update tokens
  const balances = useSelector<AppState, AppState['_farmer']['balances']>((state) => state._farmer.balances);
  const { data: account } = useAccount();

  return (
    <Container maxWidth="md">
      <Stack gap={2}>
        <PageHeader
          title="The Barn Raise"
          purpose="Rebuilding Beanstalk"
          description="Earn yield through purchasing & activating Fertilizer, the Barn Raise token"
        />
        {/* Section 1: Fertilizer Remaining */}
        <WrappedRemainingFertilizer />
        {/* Section 2: Purchase Fertilizer */}
        <Form />
        {/* Section 3: My Fertilizer */}
        <MyFertilizer />
      </Stack>
    </Container>
  );
};

export default BarnRaisePage;

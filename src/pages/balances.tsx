/* eslint-disable */
import React, { useState } from 'react';
import {Box, Card, Container, Grid, Stack} from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import TotalBalanceCard from 'components/v2/Balances/Cards/TotalBalancesCard';
import FertilizerCard from 'components/v2/Balances/Cards/FertilizerCard';
import RewardsCard from 'components/v2/Balances/Cards/RewardsCard';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBalances';
import SiloAssetCard from 'components/v2/Balances/Cards/SiloAssetCard';
import { BEAN, PODS, SEEDS, STALK } from 'constants/tokens';
import PodCard from 'components/v2/Balances/Cards/PodsCard';
import Stat from 'components/v2/Common/Stat';
import { displayBN } from 'util/index';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BlurComponent from "../components/v2/Common/BlurComponent";
import MainnetBlur from "../components/v2/Common/MainnetBlur";
import SimpleLineChart from "../components/v2/Charts/SimpleLineChart";

const BalancesPage: React.FC = () => {
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo)
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field)
  const farmerFertilizer = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.fertilizer)
  // const farmerField = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.field)
  const breakdown = useFarmerSiloBreakdown();

  if(!farmerSilo) return null;

  return (
    <Container maxWidth="lg">
      <Card sx={{ p: 2 }}>
        {/*<Box sx={{ width: '100%', position: 'relative' }}>*/}
        {/*  <BlurComponent>*/}
        {/*    Connect your wallet to see your Beanstalk balances.*/}
        {/*  </BlurComponent>*/}
        {/*  <TotalBalanceCard breakdown={breakdown} />*/}
        {/*</Box>*/}
        <TotalBalanceCard breakdown={breakdown} />
        <Stack sx={{ p: 2 }}>
          <Grid container spacing={1} rowSpacing={3}>
            <Grid item xs={12} md={3}>
              <Stat
                title={`My Stalk`}
                icon={<TokenIcon token={STALK} />}
                amount={displayBN(farmerSilo.stalk.total)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`My Seeds`}
                icon={<TokenIcon token={SEEDS} />}
                amount={displayBN(farmerSilo.seeds.total)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`My Pods`}
                icon={<TokenIcon token={PODS} />}
                amount={displayBN(farmerField.pods)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`Unfertilized Beans`}
                icon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                amount={displayBN(farmerFertilizer.tokens['6074'])}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Card>
      {/* <Stack gap={2}>
        <PageHeader
          title={<strong>Balances</strong>}
          description="View your Beanstalk balances and claim rewards"
        />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TotalBalanceCard breakdown={breakdown} />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row" alignItems="stretch" spacing={1}>
              <Grid item xs={12} md={6} lg={3}>
                <SiloAssetCard
                  token={STALK}
                  state={farmerSilo.stalk}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <SiloAssetCard
                  token={SEEDS}
                  state={farmerSilo.seeds}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <PodCard state={farmerField} />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <FertilizerCard />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <RewardsCard
            farmerSilo={farmerSilo}
            farmerField={farmerField}
          />
        </Grid>
      </Stack> */}
    </Container>
  )
};

export default BalancesPage;

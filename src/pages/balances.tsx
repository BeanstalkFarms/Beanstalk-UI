/* eslint-disable */
import React, { useState } from 'react';
import { Container, Grid, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import TotalBalanceCard from 'components/v2/Balances/Cards/TotalBalancesCard';
import FertilizerCard from 'components/v2/Balances/Cards/FertilizerCard';
import RewardsCard from 'components/v2/Balances/Cards/RewardsCard';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import SiloAssetCard from 'components/v2/Balances/Cards/SiloAssetCard';
import { SEEDS, STALK } from 'constants/v2/tokens';
import PodCard from 'components/v2/Balances/Cards/PodsCard';

const BalancesPage: React.FC = () => {
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo)
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field)
  // const farmerField = useSelector<AppState, AppState['_farmer']['fertilizer']>((state) => state._farmer.field)
  const breakdown = useSiloTokenBreakdown();

  if(!farmerSilo) return null;

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
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
      </Stack>
    </Container>
  )
};

export default BalancesPage;

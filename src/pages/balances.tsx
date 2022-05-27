/* eslint-disable */
import React, {useState} from 'react';
import { Container, Grid, Stack } from '@mui/material';
import PageHeader from 'components/v2/Common/PageHeader';
import TotalBalanceCard from 'components/v2/Balances/Cards/TotalBalancesCard';
import StalkCard from 'components/v2/Balances/Cards/StalkCard';
import SeedCard from 'components/v2/Balances/Cards/SeedsCard';
import FertilizerCard from 'components/v2/Balances/Cards/FertilizerCard';
import RewardsCard from 'components/v2/Balances/Cards/RewardsCard';

const BalancesPage: React.FC = () => {
  const [balancesTab, setBalancesTab] = useState("user-balance")
  const handleSetTab = (tab: string) => {setBalancesTab(tab)};

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
          purpose="View Beanstalk balances"
          description="View all balances"
        />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TotalBalanceCard
              title="My Total Balance"
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row" alignItems="stretch" spacing={1}>
              <Grid item xs={12} md={6} lg={3}>
                <StalkCard
                  title="My Stalk"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <SeedCard
                  title="My Seeds"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <StalkCard
                  title="My Seeds"
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <FertilizerCard
                  title="My Fertilizer"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <RewardsCard title={"test"}/>
        </Grid>
      </Stack>
    </Container>
  )
};

export default BalancesPage;

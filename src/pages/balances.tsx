/* eslint-disable */
import React from 'react';
import {Card, Container, Grid, Stack} from '@mui/material';
import TotalBalanceCard from 'components/Balances/Cards/TotalBalancesCard';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { BEAN, PODS, SEEDS, STALK } from 'constants/tokens';
import Stat from 'components/Common/Stat';
import { displayBN } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import useFarmerTotalFertilizer from "hooks/useFarmerTotalFertilizer";

const BalancesPage: React.FC = () => {
  // State
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo)
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field)

  // Breakdowns
  const breakdown = useFarmerSiloBreakdown();
  const fertilizerSummary = useFarmerTotalFertilizer();

  if(!farmerSilo) return null;

  return (
    <Container maxWidth="lg">
      <Card sx={{ p: 2 }}>
        <TotalBalanceCard breakdown={breakdown} />
        <Card sx={{ p: 2 }}>
          <Grid container spacing={1} rowSpacing={3}>
            <Grid item xs={12} md={3}>
              <Stat
                title={`Stalk`}
                tooltip='This is your total Stalk balance. Stalk is the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo.'
                icon={<TokenIcon token={STALK} />}
                amount={displayBN(farmerSilo.stalk.total)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`Seeds`}
                tooltip='This is your total Seed balance. Each Seed yields 1/10000 Grown Stalk each Season. Grown Stalk must be claimed in order to be included in your Stalk balance and start earning interest.'
                icon={<TokenIcon token={SEEDS} />}
                amount={displayBN(farmerSilo.seeds.total)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`Pods`}
                tooltip='This is your total Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line, head over to the Field page.'
                icon={<TokenIcon token={PODS} />}
                amount={displayBN(farmerField.pods)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stat
                title={`Unfertilized Beans`}
                tooltip='The number of Beans to be earned from your Fertilizer. For more information on your Fertilizer, head over to the Barn Raise page.'
                icon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                amount={displayBN(fertilizerSummary.unfertilized)}
                variant="h2"
                sx={{ fontSize: '24px !important' }}
              />
            </Grid>
          </Grid>
        </Card>
      </Card>
    </Container>
  )
};

export default BalancesPage;

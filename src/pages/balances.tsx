import React from 'react';
import { Card, Container, Grid, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import Stat from 'components/Common/Stat';
import TotalBalanceCard from 'components/Balances/TotalBalancesCard';
import TokenIcon from 'components/Common/TokenIcon';
import useFarmerTotalFertilizer from '~/hooks/useFarmerTotalFertilizer';
import useFarmerSiloBreakdown from '~/hooks/useFarmerSiloBreakdown';
import { displayFullBN } from '~/util/index';
import { PODS, SEEDS, STALK, SPROUTS } from '~/constants/tokens';
import { AppState } from '~/state';

const BalancesPage: React.FC = () => {
  /// State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>((state) => state._farmer.barn);

  // Breakdowns
  const breakdown = useFarmerSiloBreakdown();
  const fertilizerSummary = useFarmerTotalFertilizer();

  if (!farmerSilo) return null;

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <Card sx={{ p: 2 }}>
          <TotalBalanceCard 
            breakdown={breakdown}
          />
          <Card sx={{ p: 1 }}>
            <Grid container spacing={1} rowSpacing={3}>
              <Grid item xs={6} md={3}>
                <Stat
                  title="Stalk"
                  titleTooltip="This is your total Stalk balance. Stalk is the ownership token of the Beanstalk DAO. The Stalk token entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo."
                  amountIcon={<TokenIcon token={STALK} />}
                  amount={displayFullBN(farmerSilo.stalk.total, STALK.displayDecimals)}
                  variant="h4"
                  gap={0}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat
                  title="Seeds"
                  titleTooltip="This is your total Seed balance. Each Seed yields 1/10000 Grown Stalk each Season. Grown Stalk must be claimed in order to be included in your Stalk balance and start earning interest."
                  amountIcon={<TokenIcon token={SEEDS} />}
                  amount={displayFullBN(farmerSilo.seeds.total, SEEDS.displayDecimals)}
                  variant="h4"
                  gap={0}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat
                  title="Pods"
                  titleTooltip="This is your total Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line, head over to the Field page."
                  amountIcon={<TokenIcon token={PODS} />}
                  amount={(
                    <>
                      {displayFullBN(farmerField.pods, PODS.displayDecimals)}
                      {farmerField.harvestablePods?.gt(0) && (
                        <Typography color="primary" variant="h4">+ {displayFullBN(farmerField.harvestablePods, PODS.displayDecimals)}</Typography>
                      )}
                    </>
                  )}
                  variant="h4"
                  gap={0}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Stat
                  title="Sprouts"
                  titleTooltip="This is your total Sprout balance. Sprouts represent how many Beans there are left to be earned from your Fertilizer. Sprouts become Fertilized pro rata as the Bean supply increases. For more information on your Fertilizer, head over to the Barn Raise page."
                  amountIcon={<TokenIcon token={SPROUTS} />}
                  amount={(
                    <>
                      {displayFullBN(farmerBarn.unfertilizedSprouts, SPROUTS.displayDecimals)}
                      {farmerBarn.fertilizedSprouts?.gt(0) && (
                        <Typography color="primary" variant="h4">+ {displayFullBN(farmerBarn.fertilizedSprouts, SPROUTS.displayDecimals)}</Typography>
                      )}
                    </>
                  )}
                  variant="h4"
                  gap={0}
                />
              </Grid>
            </Grid>
          </Card>
        </Card>
      </Stack>
    </Container>
  );
};

export default BalancesPage;

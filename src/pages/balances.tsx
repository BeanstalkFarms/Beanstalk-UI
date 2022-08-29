import React from 'react';
import { Card, Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import TotalBalanceCard from '~/components/Balances/TotalBalancesCard';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { PODS, SEEDS, STALK, SPROUTS } from '~/constants/tokens';
import { AppState } from '~/state';
import StatsCard, { StatItem } from '~/components/Common/StatsCard';
import PageHeader from '~/components/Common/PageHeader';
import GuideButton from '~/components/Common/Guide/GuideButton';
import { HOW_TO_UNDERSTAND_BALANCES } from '~/util';

const BalancesPage: React.FC = () => {
  /// State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>((state) => state._farmer.barn);

  // Breakdowns
  const breakdown = useFarmerBalancesBreakdown();

  /// Total Balances
  const STAT_ITEMS: StatItem[] = [
    {
      title: 'Stalk',
      tooltip: 'This is your total Stalk balance. Stalk is the governance token of the Beanstalk DAO. Stalk entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo.',
      token: STALK,
      amount: farmerSilo.stalk.total
    },
    {
      title: 'Seeds',
      tooltip: 'This is your total Seed balance. Each Seed yields 1/10000 Grown Stalk each Season. Grown Stalk must be Mown to add it to your Stalk balance.',
      token: SEEDS,
      amount: farmerSilo.seeds.total
    },
    {
      title: 'Pods',
      tooltip: 'This is your total Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line, head over to the Field page.',
      token: PODS,
      amount: farmerField.pods,
      amountModifier: farmerField.harvestablePods?.gt(0) ? farmerField.harvestablePods : undefined
    },
    {
      title: 'Sprouts',
      tooltip: 'This is your total Sprout balance. The number of Beans left to be earned from your Fertilizer. Sprouts become Rinsable on a pari passu basis. For more information on your Sprouts, head over to the Barn page.',
      token: SPROUTS,
      amount: farmerBarn.unfertilizedSprouts,
      amountModifier: farmerBarn.fertilizedSprouts?.gt(0) ? farmerBarn.fertilizedSprouts : undefined
    }
  ];

  if (!farmerSilo) return null;

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Balances"
          description="View your Beanstalk assets"
          href="https://docs.bean.money/additional-resources/asset-states"
          control={
            <GuideButton
              title="The Farmers' Almanac: Balances Guides"
              guides={[
                HOW_TO_UNDERSTAND_BALANCES,
              ]}
            />
          }
      />
        <Card sx={{ p: 2 }}>
          <TotalBalanceCard 
            breakdown={breakdown}
          />
          <StatsCard stats={STAT_ITEMS} />
        </Card>
      </Stack>
    </Container>
  );
};

export default BalancesPage;

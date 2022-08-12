import React, { useMemo } from 'react';
import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import Overview from '~/components/Silo/Overview';
import RewardsBar from '~/components/Silo/RewardsBar';
import Whitelist from '~/components/Silo/Whitelist';
import PageHeader from '~/components/Common/PageHeader';
import RewardsDialog from '~/components/Silo/RewardsDialog';
import DropdownIcon from '~/components/Common/DropdownIcon';
import useWhitelist from '~/hooks/useWhitelist';
import usePools from '~/hooks/usePools';
import useFarmerSiloBreakdown from '~/hooks/useFarmerSiloBreakdown';
import useToggle from '~/hooks/display/useToggle';
import useRevitalized from '~/hooks/useRevitalized';
import useSeason from '~/hooks/useSeason';
import { AppState } from '~/state';
import { SEEDS, STALK, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import useFarmerSiloBalances from '~/hooks/useFarmerSiloBalances';
import useGetChainToken from '~/hooks/useGetChainToken';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import useAccount from '~/hooks/ledger/useAccount';
import TokenIcon from '~/components/Common/TokenIcon';
import GuideButton from '~/components/Common/Guide/GuideButton';
import {
  CLAIM_SILO_REWARDS,
  HOW_TO_DEPOSIT_IN_THE_SILO
} from '~/util/Guides';

const SiloPage : React.FC = () => {
  /// Helpers
  const account = useAccount();
  const getChainToken = useGetChainToken();
  
  /// Chain Constants
  const whitelist = useWhitelist();
  const pools     = usePools();

  /// State
  const farmerSilo    = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const breakdown     = useFarmerSiloBreakdown();
  const balances      = useFarmerSiloBalances();
  const season        = useSeason();
  const { revitalizedStalk, revitalizedSeeds } = useRevitalized();

  /// Calculate Unripe Silo Balance
  const urBean      = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3  = getChainToken(UNRIPE_BEAN_CRV3);
  const unripeDepositedBalance = balances[urBean.address]?.deposited.amount
    .plus(balances[urBeanCrv3.address]?.deposited.amount);

  /// Local state
  const [open, show, hide] = useToggle();
  const config = useMemo(() => ({
    whitelist: Object.values(whitelist),
    poolsByAddress: pools,
  }), [whitelist, pools]);

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="The Silo"
          description="Earn yield and participate in Beanstalk governance by depositing whitelisted assets"
          href="https://docs.bean.money/farm/silo"
          // makes guide display to the right of the title on mobile
          OuterStackProps={{ direction: 'row' }}
          control={
            <GuideButton
              title="The Farmers' Almanac: Silo Guides"
              guides={[
                HOW_TO_DEPOSIT_IN_THE_SILO,
                CLAIM_SILO_REWARDS,
              ]}
            />
          }
        />
        <Overview
          farmerSilo={farmerSilo}
          beanstalkSilo={beanstalkSilo}
          breakdown={breakdown}
          season={season}
        />
        <Card>
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {(!account || breakdown.totalValue?.eq(0)) && (
              <BlurComponent>
                <Stack justifyContent="center" alignItems="center" gap={1} px={1}>
                  <Typography variant="body1" color="gray">Receive <TokenIcon token={STALK} />Stalk and <TokenIcon token={SEEDS} />Seeds for Depositing whitelisted assets in the Silo. Stalkholders earn a portion of new Bean mints. Seeds grow into Stalk every season.</Typography>
                </Stack>
              </BlurComponent>
            )}
            <Stack
              sx={{ pl: 2, pr: 2, py: 1.5 }}
              direction={{ xs: 'column', lg: 'row' }}
              justifyContent={{ lg: 'space-between' }}
              alignItems={{ xs: 'auto', lg: 'center' }}
              rowGap={1.5}
            >
              <RewardsBar
                beans={farmerSilo.beans}
                stalk={farmerSilo.stalk}
                seeds={farmerSilo.seeds}
                revitalizedStalk={revitalizedStalk}
                revitalizedSeeds={revitalizedSeeds}
                hideRevitalized={unripeDepositedBalance?.eq(0)}
              />
              <Box
                justifySelf={{ xs: 'auto', lg: 'flex-end' }}
                width={{ xs: '100%', lg: 'auto' }}
              >
                <Button
                  size="medium"
                  variant="contained"
                  sx={{ width: '100%', whiteSpace: 'nowrap' }}
                  endIcon={<DropdownIcon open={false} />}
                  onClick={show}
                >
                  Claim Rewards
                </Button>
              </Box>
            </Stack>
          </Box>
        </Card>
        <Whitelist
          config={config}
          farmerSilo={farmerSilo}
        />
        <RewardsDialog
          open={open}
          handleClose={hide}
          beans={farmerSilo.beans}
          stalk={farmerSilo.stalk}
          seeds={farmerSilo.seeds}
          revitalizedStalk={revitalizedStalk}
          revitalizedSeeds={revitalizedSeeds}
        />
      </Stack>
    </Container>
  );
};

export default SiloPage;

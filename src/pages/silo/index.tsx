import React, { useMemo } from 'react';
import { Alert, Box, Button, Card, Container, Stack, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Overview from 'components/Silo/Overview';
import RewardsBar from 'components/Silo/RewardsBar';
import Whitelist from 'components/Silo/Whitelist';
import PageHeader from 'components/Common/PageHeader';
import { SupportedChainId } from 'constants/index';
import useWhitelist from 'hooks/useWhitelist';
import usePools from 'hooks/usePools';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import useChainId from 'hooks/useChain';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/index';
import useToggle from 'hooks/display/useToggle';
import useRevitalized from 'hooks/useRevitalized';
import RewardsDialog from 'components/Silo/RewardsDialog';
import DropdownIcon from 'components/Common/DropdownIcon';

const SiloPage : React.FC = () => {
  /// Chain Constants
  const whitelist = useWhitelist();
  const pools     = usePools();
  const chainId   = useChainId();

  /// State
  const farmerSilo    = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const { season }    = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const breakdown     = useFarmerSiloBreakdown();
  const { revitalizedStalk, revitalizedSeeds } = useRevitalized();

  /// Local state
  const [open, show, hide] = useToggle();
  const config = useMemo(() => ({
    whitelist: Object.values(whitelist),
    poolsByAddress: pools,
  }), [whitelist, pools]);

  /// TEMP: Exploiter calculations
  const exploiterEarnedBeans = new BigNumber(6458.005059);
  const ownership = farmerSilo.stalk.active.div(beanstalkSilo.stalk.active);

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="The Silo"
          description="Earn yield by depositing liquidity and participate in protocol governance"
        />
        <Overview
          farmerSilo={farmerSilo}
          beanstalkSilo={beanstalkSilo}
          breakdown={breakdown}
          season={season}
        />
        {chainId === SupportedChainId.MAINNET ? (
          <Alert severity="info" variant="standard" sx={{ borderColor: 'secondary.dark', borderWidth: 1, borderStyle: 'solid' }}>
            The exploiter{'\''}s Earned Beans were distributed pro rata to Silo Members. Your Earned Bean balance has increased by ~{displayFullBN(exploiterEarnedBeans.times(ownership), 2)} Beans.
          </Alert>
        ) : null}
        <Card sx={{ pl: 2, pr: 2, py: 1.5 }}>
          <Stack
            direction={{ lg: 'row', xs: 'column' }}
            justifyContent={{ lg: 'space-between' }}
            alignItems={{ lg: 'center', xs: 'auto' }}
            rowGap={1.5}
          >
            <RewardsBar
              beans={farmerSilo.beans}
              stalk={farmerSilo.stalk}
              seeds={farmerSilo.seeds}
              revitalizedStalk={revitalizedStalk}
              revitalizedSeeds={revitalizedSeeds}
            />
            <Box
              justifySelf={{ lg: 'flex-end', xs: 'auto' }}
              width={{ xs: '100%', lg: 'auto' }}
            >
              <Tooltip title={chainId === SupportedChainId.MAINNET ? <>Claiming Silo rewards will be available upon Replant.</> : ''}>
                <span>
                  <Button
                    disabled={chainId === SupportedChainId.MAINNET}
                    size="medium"
                    variant="contained"
                    sx={{ height: '100%', width: { xs: '100%', lg: 'auto' } }}
                    endIcon={<DropdownIcon open={false} />}
                    onClick={show}
                  >
                    Claim Rewards
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
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

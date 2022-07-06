import React, { useState } from 'react';
import { Alert, Box, Button,  Card,  Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Overview from 'components/Silo/Overview';
import RewardsBar from 'components/Silo/RewardsBar';
import Whitelist from 'components/Silo/Whitelist';
import PageHeader from 'components/Common/PageHeader';
import { SNAPSHOT_LINK, SupportedChainId } from 'constants/index';
import snapshotIcon from 'img/ecosystem/snapshot-logo.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import useWhitelist from 'hooks/useWhitelist';
import usePools from 'hooks/usePools';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import useChainId from 'hooks/useChain';
import BigNumber from 'bignumber.js';
import { displayFullBN } from 'util/index';
import RewardsDialog from '../../components/Silo/RewardsDialog';

const SiloPage : React.FC = () => {
  // Constants
  const WHITELIST = useWhitelist();
  const POOLS     = usePools();
  const chainId = useChainId();

  // State
  // const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const breakdown   = useFarmerSiloBreakdown();

  // Local state
  const [rewardsDialogOpen, setRewardsDialogOpen] = useState<boolean>(false);

  // Temporary
  const exploiterEarnedBeans = new BigNumber(6458.005059);
  const ownership = farmerSilo.stalk.active.div(beanstalkSilo.stalk.active);

  // Handlers
  const handleOpenRewardsDialog = () => {
    setRewardsDialogOpen(true);
  };

  const handleCloseRewardsDialog = () => {
    setRewardsDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title={<><strong>The Silo</strong><Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>: The Beanstalk DAO</Box></>}
          description="Earn yield by depositing liquidity and participate in protocol governance"
          control={(
            <Button
              href={SNAPSHOT_LINK}
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              startIcon={<img src={snapshotIcon} alt="Snapshot" style={{ height: 20 }} />}
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              Governance
            </Button>
          )}
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
        <RewardsBar
          chainId={chainId}
          beans={farmerSilo.beans}
          stalk={farmerSilo.stalk}
          seeds={farmerSilo.seeds}
          handleOpenDialog={handleOpenRewardsDialog}
        />
        <Whitelist
          config={{
            whitelist: Object.values(WHITELIST),
            poolsByAddress: POOLS,
          }}
          farmerSilo={farmerSilo}
          // beanPools={beanPools}
          // beanstalkSilo={beanstalkSilo}
        />
      </Stack>
      <RewardsDialog
        handleClose={handleCloseRewardsDialog}
        beans={farmerSilo.beans}
        stalk={farmerSilo.stalk}
        seeds={farmerSilo.seeds}
        open={rewardsDialogOpen}
      />
    </Container>
  );
};

export default SiloPage;

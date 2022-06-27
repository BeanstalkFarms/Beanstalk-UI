import React from 'react';
import { Alert, Box, Button,  Card,  Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import OverviewCard from 'components/Silo/OverviewCard';
import RewardsBar from 'components/Silo/RewardsBar';
import TokenTable from 'components/Silo/TokenTable';
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

const SiloPage : React.FC = () => {
  // Constants
  const WHITELIST = useWhitelist();
  const POOLS     = usePools();

  // State
  // const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const breakdown   = useFarmerSiloBreakdown();
  const chainId = useChainId();

  //
  const exploiterEarnedBeans = new BigNumber(6458.005059);
  const ownership = farmerSilo.stalk.active.div(beanstalkSilo.stalk.active);

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
        <OverviewCard
          farmerSilo={farmerSilo}
          beanstalkSilo={beanstalkSilo}
          breakdown={breakdown}
          season={season}
        />
        {chainId === SupportedChainId.MAINNET ? (
          // <Card>
            <Alert severity="info" variant="standard" sx={{ borderColor: 'secondary.dark', borderWidth: 1, borderStyle: 'solid' }}>
              The exploiter{`'`}s Earned Beans were distributed pro rata to Silo Members. Your Earned Bean balance has increased by ~{displayFullBN(exploiterEarnedBeans.times(ownership), 2)} Beans.
            </Alert>
          // </Card>
        ): null}
        <RewardsBar
          chainId={chainId}
          beans={farmerSilo.beans}
          stalk={farmerSilo.stalk}
          seeds={farmerSilo.seeds}
        />
        <TokenTable
          config={{
            whitelist: Object.values(WHITELIST),
            poolsByAddress: POOLS,
          }}
          farmerSilo={farmerSilo}
          // beanPools={beanPools}
          // beanstalkSilo={beanstalkSilo}
        />
      </Stack>
    </Container>
  );
};

export default SiloPage;

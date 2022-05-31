import React from 'react';
import { Box, Button,  Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import NextSeason from 'components/v2/Silo/NextSeason';
import OverviewCard from 'components/v2/Silo/OverviewCard';
import RewardsBar from 'components/v2/Silo/RewardsBar';
import TokenTable from 'components/v2/Silo/TokenTable';
import PageHeader from 'components/v2/Common/PageHeader';
import { SNAPSHOT_LINK } from 'constants/index';
import snapshotIcon from 'img/snapshot-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import useWhitelist from 'hooks/useWhitelist';
import usePools from 'hooks/usePools';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';

const SiloPage : React.FC = () => {
  // const beanPrice   = useSelector<AppState, AppState['_bean']['price']>((state) => state._bean.price);
  const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  const { sunrise, season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const breakdown   = useSiloTokenBreakdown();
  const whitelist   = useWhitelist();
  const poolsByAddress = usePools();
  const chainId = useChainId();

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title={<><strong>The Silo</strong><Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>: The Beanstalk DAO</Box></>}
          description="Earn yield by depositing liquidity & participating in protocol governance"
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
        {/* TEMP: Hide next Season metrics on MAINNET. */}
        {chainId !== SupportedChainId.MAINNET && (
          <NextSeason
            title={(
              `Next Season's Predicted Silo Rewards in ${sunrise.remaining.as('minutes').toLocaleString('en-US', { maximumFractionDigits: 0 })}m`
            )}
          />
        )}
        <OverviewCard
          farmerSilo={farmerSilo}
          beanstalkSilo={beanstalkSilo}
          breakdown={breakdown}
          season={season}
        />
        <RewardsBar
          chainId={chainId}
          beans={farmerSilo.beans}
          stalk={farmerSilo.stalk}
          seeds={farmerSilo.seeds}
        />
        <TokenTable
          config={{
            whitelist: Object.values(whitelist),
            poolsByAddress: poolsByAddress,
          }}
          beanPools={beanPools}
          farmerSilo={farmerSilo}
          // beanPrice={beanPrice}
        />
      </Stack>
    </Container>
  );
};

export default SiloPage;

import React from 'react';
import { Button,  Container, Stack } from '@mui/material';
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

const SiloPage : React.FC = () => {
  const beanPrice   = useSelector<AppState, AppState['_bean']['price']>((state) => state._bean.price);
  const beanPools   = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const farmerSilo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const sunrise     = useSelector<AppState, AppState['_beanstalk']['sun']['sunrise']>((state) => state._beanstalk.sun.sunrise);
  const whitelist   = useWhitelist();
  const poolsByAddress = usePools();

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="The Silo"
          purpose="The Beanstalk DAO"
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
        <NextSeason
          title={(
            `Next Season's Predicted Silo Rewards in ${sunrise.remaining.as('minutes').toLocaleString('en-US', { maximumFractionDigits: 0 })}m`
          )}
        />
        <OverviewCard
          stalk={farmerSilo.stalk}
        />
        <RewardsBar
          beans={farmerSilo.beans}
          stalk={farmerSilo.stalk}
          seeds={farmerSilo.seeds}
        />
        <TokenTable
          config={{
            whitelist: Object.values(whitelist),
            poolsByAddress: poolsByAddress,
          }}
          beanPrice={beanPrice}
          beanPools={beanPools}
          farmerSilo={farmerSilo}
        />
      </Stack>
    </Container>
  );
};

export default SiloPage;

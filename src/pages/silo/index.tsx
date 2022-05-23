import React, { useMemo } from 'react';
import { Button, Card, Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import Pools from 'constants/v2/pools';
import { AppState } from 'state';
import NextSeason from 'components/v2/Silo/NextSeason';
import OverviewCard from 'components/v2/Silo/OverviewCard';
import RewardsBar from 'components/v2/Silo/RewardsBar';
import TokenTable from 'components/v2/Silo/TokenTable';
import PageHeader from 'components/v2/Common/PageHeader';
import { SNAPSHOT_LINK } from 'constants/index';
import snapshotIcon from 'img/snapshot-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNetwork } from 'wagmi';
import usePools from 'hooks/usePools';
import { whitelist as siloWhitelist } from 'constants/v2/tokens';

export default function SiloV2() {
  const poolState = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const siloState = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const { activeChain } = useNetwork();
  const pools = usePools();
  
  const whitelist = useMemo(() => {
    if (activeChain?.id) {
      return siloWhitelist.map((token) => token[activeChain.id]);
    }
    return [];
  }, [activeChain]);

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
        <NextSeason />
        <OverviewCard
          stalk={siloState.stalk}
        />
        <RewardsBar
          beans={siloState.beans}
          stalk={siloState.stalk}
          seeds={siloState.seeds}
        />
        <TokenTable
          config={{
            whitelist: whitelist,
          }}
          data={siloState}
        />
      </Stack>
    </Container>
  );
}

/* <Card>
  {whitelist.map((_token) => {
    const token = _token[activeChain?.id]
    const pool = pools[token.address];
    return (
      <div>
        <img src={token.logo} style={{ width: 20, height: 20 }} alt="" />
        <div>({token.slug}) {token.name}: {token.address}</div>
        {pool ? (
          <div>
            Pool: {pool.name}<br />
            Tokens: {pool.tokens?.toString()}<br />
            Price: {poolState[pool.address]?.price.toString()}<br />
            Reserves: [{poolState[pool.address]?.reserves.map((r) => r.toString()).join(', ')}]<br />
          </div>
        ) : null}
        <div>
          Deposits: {siloState.tokens[token.address]?.deposited.toString() || 'none'}<br />
        </div>
        <br />
      </div>
    );
  })}
</Card> */

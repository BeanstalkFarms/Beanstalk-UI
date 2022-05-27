import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Actions from 'components/v2/Silo/Actions';
import Deposits from 'components/v2/Silo/Deposits';
import useWhitelist from 'hooks/useWhitelist';
import { Container, Stack } from '@mui/material';
import usePools from 'hooks/usePools';
import PageHeader from 'components/v2/Common/PageHeader';
import PoolCard from '../../components/v2/Silo/PoolCard';

const TokenPage: React.FC<{}> = () => {
  const { address } = useParams<{ address: string }>();
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanPools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const WHITELIST = useWhitelist();
  const POOLS = usePools();

  // Ensure this address is a whitelisted token
  if (!WHITELIST || !address || !WHITELIST[address]) return (<div>Not found</div>);

  // Load data about the LP token
  const token = WHITELIST[address];
  const pool  = POOLS[address];
  const siloToken = farmerSilo.tokens[token.address];
  const poolState = beanPools[address];
  const hasPool = poolState !== undefined;

  // If no data loaded...
  if (!token || !siloToken) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        {/* Header */}
        <PageHeader
          title={`${token.name} Silo`}
          description={`Deposit ${token.name} to earn Stalk / Seed`}
          returnPath="/silo"
        />
        {hasPool && (
          <PoolCard
            pool={pool}
            poolState={poolState}
            // isButton={true}
          />
        )}
        <Actions
          token={token}
          poolState={poolState}
        />
        <Deposits
          token={token}
          siloToken={siloToken}
        />
      </Stack>
    </Container>
  );
};

export default TokenPage;

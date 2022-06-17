import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import SiloActions from 'components/Silo/Actions';
import DepositsCard from 'components/Silo/DepositsCard';
import useWhitelist from 'hooks/useWhitelist';
import { Container, Stack } from '@mui/material';
import usePools from 'hooks/usePools';
import PageHeader from 'components/Common/PageHeader';
import PoolCard from 'components/Silo/PoolCard';

const TokenPage: React.FC<{}> = () => {
  // Constants
  const WHITELIST = useWhitelist();
  const POOLS     = usePools();

  // Routing
  const { address } = useParams<{ address: string }>();

  // State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanPools  = useSelector<AppState, AppState['_bean']['pools']>((state) =>  state._bean.pools);

  console.debug('[page:silo/token] whitelist ', WHITELIST, POOLS, beanPools);

  // Ensure this address is a whitelisted token
  // FIXME: case sensitivity
  if (!address || !WHITELIST?.[address]) {
    return (
      <div>Not found</div>
    );
  }

  // Load this Token from the whitelist
  const TOKEN = WHITELIST[address];
  const balance = farmerSilo.balances[TOKEN.address];

  // Most Silo Tokens will have a corresponding Pool.
  // If one is available, show a PoolCard with state info.
  const POOL  = POOLS[address];
  const beanPool = beanPools[address];

  // If no data loaded...
  if (!TOKEN) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        {/* Header */}
        <PageHeader
          title={<strong>{TOKEN.name} Silo</strong>}
          description={`Deposit ${TOKEN.name} to earn Stalk & Seeds`}
          returnPath="/silo"
        />
        {beanPool && (
          <PoolCard
            pool={POOL}
            poolState={beanPool}
          />
        )}
        <SiloActions token={TOKEN} />
        <DepositsCard
          token={TOKEN}
          balance={balance}
        />
      </Stack>
    </Container>
  );
};

export default TokenPage;

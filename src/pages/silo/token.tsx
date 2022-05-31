import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import SiloActions from 'components/v2/Silo/Actions';
import DepositsTable from 'components/v2/Silo/Deposits';
import useWhitelist from 'hooks/useWhitelist';
import { Container, Stack } from '@mui/material';
import usePools from 'hooks/usePools';
import PageHeader from 'components/v2/Common/PageHeader';
import PoolCard from '../../components/v2/Silo/PoolCard';

const TokenPage: React.FC<{}> = () => {
  // Routing
  const { address } = useParams<{ address: string }>();

  // State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanPools  = useSelector<AppState, AppState['_bean']['pools']>((state) =>  state._bean.pools);

  // Constants
  const Whitelist = useWhitelist();
  const Pools     = usePools();

  console.debug('[page:silo/token] whitelist ', Whitelist, Pools, beanPools);

  // Ensure this address is a whitelisted token
  if (!address || !Whitelist?.[address]) return (<div>Not found</div>);

  // Load this Token from the whitelist
  const Token = Whitelist[address];
  const balance = farmerSilo.tokens[Token.address];

  // Most Silo Tokens will have a corresponding Pool.
  // If one is available, show a PoolCard with state info.
  const Pool  = Pools[address];
  const poolState = beanPools[address];
  const loadedPool = poolState !== undefined;

  // If no data loaded...
  if (!Token) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        {/* Header */}
        <PageHeader
          title={<strong>{Token.name} Silo</strong>}
          description={`Deposit ${Token.name} to earn Stalk & Seeds`}
          returnPath="/silo"
        />
        {loadedPool && (
          <PoolCard
            pool={Pool}
            poolState={poolState}
            // isButton={true}
          />
        )}
        <SiloActions token={Token} />
        <DepositsTable
          token={Token}
          balance={balance}
        />
      </Stack>
    </Container>
  );
};

export default TokenPage;

import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SiloActions from 'components/Silo/Actions';
import { Container, Stack } from '@mui/material';
import PoolCard from 'components/Silo/PoolCard';
import PageHeaderSecondary from 'components/Common/PageHeaderSecondary';
import TokenIcon from 'components/Common/TokenIcon';
import { ERC20Token } from '~/classes/Token';
import usePools from '~/hooks/usePools';
import useWhitelist from '~/hooks/useWhitelist';
import { AppState } from '~/state';

const TokenPage: React.FC<{}> = () => {
  // Constants
  const whitelist = useWhitelist();
  const pools     = usePools();

  // Routing
  let { address } = useParams<{ address: string }>();
  address = address?.toLowerCase();

  // State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const poolStates = useSelector<AppState, AppState['_bean']['pools']>((state) =>  state._bean.pools);

  // Ensure this address is a whitelisted token
  if (!address || !whitelist?.[address]) {
    return (
      <div>Not found</div>
    );
  }

  // Load this Token from the whitelist
  const whitelistedToken = whitelist[address];
  const siloBalance = farmerSilo.balances[whitelistedToken.address];

  // Most Silo Tokens will have a corresponding Pool.
  // If one is available, show a PoolCard with state info.
  const pool      = pools[address];
  const poolState = poolStates[address];
  
  // If no data loaded...
  if (!whitelistedToken) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        <PageHeaderSecondary
          title={whitelistedToken.name}
          icon={<TokenIcon token={whitelistedToken} />}
          returnPath="/silo"
        />
        {whitelistedToken.isLP && (
          <PoolCard
            pool={pool}
            poolState={poolState}
          //   ButtonProps={{
          //     href: `https://etherscan.io/address/${pool.address}`,
          //     target: '_blank',
          //     rel: 'noreferrer'
          //   }}
          />
        )}
        <SiloActions
          pool={pool}
          token={whitelistedToken as ERC20Token}
          siloBalance={siloBalance}
        />
      </Stack>
    </Container>
  );
};

export default TokenPage;

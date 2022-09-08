import { Container, Stack } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ERC20Token } from '~/classes/Token';
import GuideButton from '~/components/Common/Guide/GuideButton';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import TokenIcon from '~/components/Common/TokenIcon';
import SiloActions from '~/components/Silo/Actions';
import PoolCard from '~/components/Silo/PoolCard';
import usePools from '~/hooks/beanstalk/usePools';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import { AppState } from '~/state';
import {
  HOW_TO_CLAIM_WITHDRAWALS,
  HOW_TO_CONVERT_DEPOSITS,
  HOW_TO_DEPOSIT_IN_THE_SILO,
  HOW_TO_TRANSFER_DEPOSITS,
  HOW_TO_WITHDRAW_FROM_THE_SILO,
} from '~/util/Guides';

const TokenPage: React.FC<{}> = () => {
  // Constants
  const whitelist = useWhitelist();
  const pools = usePools();

  // Routing
  let { address } = useParams<{ address: string }>();
  address = address?.toLowerCase();

  // State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const poolStates = useSelector<AppState, AppState['_bean']['pools']>(
    (state) => state._bean.pools
  );

  // Ensure this address is a whitelisted token
  if (!address || !whitelist?.[address]) {
    return <div>Not found</div>;
  }

  // Load this Token from the whitelist
  const whitelistedToken = whitelist[address];
  const siloBalance = farmerSilo.balances[whitelistedToken.address];

  // Most Silo Tokens will have a corresponding Pool.
  // If one is available, show a PoolCard with state info.
  const pool = pools[address];
  const poolState = poolStates[address];

  // If no data loaded...
  if (!whitelistedToken) return null;

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeaderSecondary
          title={whitelistedToken.name}
          icon={
            <TokenIcon
              style={{ marginTop: 3, alignSelf: 'flex-start' }}
              token={whitelistedToken}
            />
          }
          titleAlign="left"
          returnPath="/silo"
          control={
            <GuideButton
              title="The Farmers' Almanac: Silo Guides"
              guides={[
                HOW_TO_DEPOSIT_IN_THE_SILO,
                HOW_TO_CONVERT_DEPOSITS,
                HOW_TO_TRANSFER_DEPOSITS,
                HOW_TO_WITHDRAW_FROM_THE_SILO,
                HOW_TO_CLAIM_WITHDRAWALS,
              ]}
            />
          }
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

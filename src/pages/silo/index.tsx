import React from 'react';
import { Button, Card, Container, Stack } from '@mui/material';
import { useSelector } from 'react-redux';
import { SiloTokens } from 'constants/v2/tokens';
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

/* <PageHeader
  title="The Field"
  purpose="The Decentralized Credit Facility"
  description="Earn yield through lending Beans to Beanstalk when there is Available Soil in exchange for Pods"
/> */

// const useGetSiloTokenValueUSD = () => {
//   const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
//   const prices = useSelector<AppState, AppState['prices']>((state) => state.prices);
//   return (token: Token, amount: BigNumber) => {
//     // If no pool is present, this token is 
//     if (token === Bean) {
//       return amount.times(prices.beanTWAPPrice);
//     }
//     const pool = Pools.get(token.address);
//     return amount;
//   };
// };

export default function SiloV2() {
  const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const silo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
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
        <OverviewCard />
        <RewardsBar />
        <TokenTable
          tokens={SiloTokens}
        />
        <Card>
          {/* <pre>{JSON.stringify(pools, null, 2)}</pre>
          <pre>{JSON.stringify(silo, null, 2)}</pre>
          <hr /> */}
          {SiloTokens.map((token) => {
            const pool = Pools.get(token.address);
            return (
              <div>
                <img src={token.logo} style={{ width: 20, height: 20 }} alt="" />
                <div>({token.slug}) {token.name}: {token.address}</div>
                {/* pool exists for everything except Bean silo */}
                {pool ? (
                  <div>
                    Pool: {pool.name}<br />
                    Tokens: {pool.tokens?.toString()}<br />
                    Price: {pools[pool.address].price.toString()}<br />
                    Reserves: [{pools[pool.address].reserves.map((r) => r.toString()).join(', ')}]<br />
                  </div>
                ) : null}
                <div>
                  Deposits: {silo.tokens[token.address]?.deposited.toString() || 'none'}<br />
                </div>
                <br />
                <br />
              </div>
            );
          })}
        </Card>
      </Stack>
    </Container>
  );
}

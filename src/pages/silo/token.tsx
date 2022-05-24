import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Actions from 'components/v2/Silo/Actions';
import Deposits from 'components/v2/Silo/Deposits';
import useWhitelist from 'hooks/useWhitelist';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PoolCard from '../../components/v2/Silo/PoolCard';
import { BeanPoolState } from "../../state/v2/bean/pools";
import BigNumber from "bignumber.js";

const TokenPage: React.FC<{}> = () => {
  const { address } = useParams<{ address: string }>();
  const silo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const whitelist = useWhitelist();

  if (!whitelist || !address || !whitelist[address]) return (<div>Not found</div>);

  const token = whitelist[address];
  const siloToken = silo.tokens[token.address];
  // const pool = pools[address];
  // const hasPool = pool !== undefined;
  const hasPool = true;

  console.log("POOLS: ");
  console.log(pools);

  const pool: BeanPoolState = {
    price: new BigNumber(99),
    reserves: [new BigNumber(27), new BigNumber(234)],
    deltaB: new BigNumber(234242),
    liquidity: new BigNumber(123567),
    totalCrosses: new BigNumber(1230)
  };

  if (!token || !siloToken) return null;

  return (
    <Container maxWidth="sm">
      <Stack gap={2}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Box>
            <Button
              to="/silo"
              component={RouterLink}
              variant="contained"
              color="light"
              sx={{ p: 1, borderRadius: 100, minWidth: 0 }}
            >
              <ChevronLeftIcon />
            </Button>
          </Box>
          <Stack gap={0.5}>
            <Typography variant="h2" sx={{ fontSize: 32 }}>{token.name} Silo</Typography>
            <Typography>Deposit {token.name} to earn Stalk / Seed</Typography>
          </Stack>
        </Stack>
        {hasPool && (
          <PoolCard
            address={address}
            pool={pool}
          />
        )}
        <Actions
          token={token}
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

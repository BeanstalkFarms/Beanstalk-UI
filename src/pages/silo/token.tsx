import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Actions from 'components/v2/Silo/Actions';
import Deposits from 'components/v2/Silo/Deposits';
import useWhitelist from 'hooks/useWhitelist';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import usePools from 'hooks/usePools';
import BigNumber from 'bignumber.js';
import PoolCard from '../../components/v2/Silo/PoolCard';
import { BEAN_ETH_UNISWAP_V2_POOL_MAINNET } from '../../constants/v2/pools';
import { BeanPoolState } from '../../state/v2/bean/pools';

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
  // const pool  = POOLS[address];
  const pool = BEAN_ETH_UNISWAP_V2_POOL_MAINNET;
  const siloToken = farmerSilo.tokens[token.address];
  // const poolState = beanPools[address];
  const poolState: BeanPoolState = {
    price: new BigNumber(100),
    reserves: [new BigNumber(100), new BigNumber(100)],
    deltaB: new BigNumber(100000),
    liquidity: new BigNumber(123567),
    totalCrosses: new BigNumber(100),
    supply: new BigNumber(1234)
  };
  const hasPool = poolState !== undefined;
  // If no data loaded...
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
            pool={pool}
            poolState={poolState}
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

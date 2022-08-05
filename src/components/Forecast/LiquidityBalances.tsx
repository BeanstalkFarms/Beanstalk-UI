import { Stack, Typography, Box } from '@mui/material';
import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import usePools from 'hooks/usePools';
import { BeanstalkPalette } from '../App/muiTheme';
import { BeanstalkSiloBalance } from '../../state/beanstalk/silo';
import { TokenMap } from '../../constants';
import { displayBN } from '../../util';
import SimpleStackedAreaChart from '../Common/Charts/StackedAreaChart';

export type LiquidityBalancesProps = {
  balances: TokenMap<BeanstalkSiloBalance>;
}

export type ReducedPoolData = {
  address: string;
  symbol: string;
  color: string;
  amount: BigNumber;
}

/**
 * 
 */
const LiquidityBalances: React.FC<LiquidityBalancesProps> = ({ balances }) => {
  const pools = usePools();

  const reducedPoolData = useMemo(() => (
    Object.keys(pools)
      .map<ReducedPoolData>((curr) => ({
        address: curr,
        symbol: pools[curr]?.symbol,
        color: pools[curr]?.color,
        amount: balances[curr]?.deposited?.amount.plus(balances[curr]?.withdrawn?.amount)
      }))
      .sort((a, b) => b.amount?.minus(a.amount)?.toNumber())
  ), [pools, balances]);

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent={{ xs: 'start', md: 'center' }}
      flexDirection={{ xs: 'column-reverse', md: 'row' }}
      mt={{ xs: 2, md: 0 }}
      alignItems="center"
      gap={1}
    >
      {/* Chart */}
      <Stack width={{ xs: '100%', md: '75%' }} justifyContent="end">
        <Box height="200px">
          <SimpleStackedAreaChart />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.75, pr: 2, pl: 2, pb: 0 }}>
          <Typography color={BeanstalkPalette.lightishGrey}>2/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>3/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>4/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>5/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>6/21</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>7/21</Typography>
        </Stack>
      </Stack>
      {/* Table */}
      <Stack width={{ xs: '100%', md: '20%' }} direction="row" justifyContent="space-between" gap={1}>
        <Stack gap={0.5}>
          <Typography sx={{ ml: 2 }} color="text.secondary">Pool</Typography>
          {reducedPoolData.map((pool: ReducedPoolData) => (
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ width: '12px', height: '12px', backgroundColor: pool.color }} />
              <Typography color="text.secondary">{pool.symbol}</Typography>
            </Stack>
          ))}
        </Stack>
        <Stack gap={0.5}>
          <Typography color="text.secondary">Liquidity</Typography>
          {reducedPoolData.map((pool: ReducedPoolData) => (
            <Typography
              color="text.secondary">{displayBN(pool.amount)}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LiquidityBalances;

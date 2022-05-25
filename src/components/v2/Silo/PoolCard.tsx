import React from 'react';
import { Card, Stack, Typography } from '@mui/material';
import { BeanPoolState } from 'state/v2/bean/pools';
import { SupportedChainId } from 'constants/chains';
import { displayBN } from 'util/index';
import { BEAN } from 'constants/v2/tokens';
import { Pool } from 'classes';

const PoolCard : React.FC<{
  pool: Pool;
  poolState: BeanPoolState;
}> = ({
  pool,
  poolState,
}) => (
  <Card sx={{ p: 1, pl: 2, pr: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" gap={2} alignItems="center">
        <img alt="" src={pool.logo} width="20px" />
        <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>${displayBN(poolState.price)}</Typography>
      </Stack>
      <Stack>
        <Stack direction="row" gap={0.5}>
          <Typography sx={{ opacity: 0.7 }}>liquidity:</Typography>
          <Typography>${displayBN(poolState.liquidity)}</Typography>
        </Stack>
        <Stack direction="row" gap={0.5}>
          <Typography sx={{ opacity: 0.7 }}>delta:</Typography>
          <Stack direction="row" gap={0.2}>
            <Typography>{poolState.deltaB.gte(0) ? '+' : '-'}</Typography>
            <img alt="" src={BEAN[SupportedChainId.MAINNET].logo} width="10px" />
            <Typography>{displayBN(poolState.deltaB.abs(), true)}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  </Card>
);

export default PoolCard;

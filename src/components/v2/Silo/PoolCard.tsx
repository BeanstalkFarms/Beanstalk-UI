import React from 'react';
import { ButtonBase, Card, Stack, Typography } from '@mui/material';
import { BeanPoolState } from '../../../state/v2/bean/pools';
import { SupportedChainId } from '../../../constants/chains';
import Pools from '../../../constants/v2/pools';
import { displayBN } from '../../../util';
import { BEAN } from '../../../constants/v2/tokens';

const PoolCard : React.FC<{
  pool: BeanPoolState;
  address: string;
}> = ({
  pool,
  address
}) => {
  return (
    <Card sx={{ p: 1, pl: 2, pr: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap={2} alignItems="center">
          <img alt="" src={Pools[SupportedChainId.MAINNET][address]?.logo} />
          <Typography sx={{ fontSize: '16px', fontWeight: 700 }}>${displayBN(pool.price)}</Typography>
        </Stack>
        <Stack>
          <Stack direction="row" gap="5px">
            <Typography sx={{ opacity: 0.7 }}>liquidity:</Typography>
            <Typography>${displayBN(pool.liquidity)}</Typography>
          </Stack>
          <Stack direction="row" gap="5px">
            <Typography sx={{ opacity: 0.7 }}>delta:</Typography>
            <Stack direction="row" gap="2px">
              <Typography>+</Typography>
              <img alt="" src={BEAN[SupportedChainId.MAINNET].logo} width="10px" />
              <Typography>{displayBN(pool.deltaB)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PoolCard;

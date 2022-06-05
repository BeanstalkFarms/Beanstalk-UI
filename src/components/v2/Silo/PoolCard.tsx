import React from 'react';
import { Button, ButtonProps as MuiButtonProps, Card, LinkProps, Stack, Typography } from '@mui/material';
import { BeanPoolState } from 'state/v2/bean/pools';
import { displayBN, displayFullBN } from 'util/index';
import { Pool } from 'classes';
import TokenIcon from '../Common/TokenIcon';

const PoolCard: React.FC<{
  pool: Pool;
  poolState: BeanPoolState;
  ButtonProps: MuiButtonProps & LinkProps;
}> = ({
  pool,
  poolState,
  ButtonProps,
}) => {
  const cardContent = (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
      >
        <Stack direction="row" spacing={0.25} sx={{ fontSize: 24 }}>
          <TokenIcon token={pool.tokens[0]} />
          <TokenIcon token={pool.tokens[1]} />
        </Stack>
        <Typography sx={{ fontWeight: 600, pt: 0.2 }}>
          ${displayFullBN(poolState?.price, 4)}
        </Typography>
      </Stack>
      <Stack>
        <Stack justifyContent="end" direction="row" gap={0.6}>
          <Typography
            color="text.secondary"
            sx={{ fontSize: ButtonProps ? '13px' : null }}>
            liquidity:
          </Typography>
          <Typography
            sx={{ fontSize: ButtonProps ? '13px' : null }}
          >
            ${displayBN(poolState?.liquidity)}
          </Typography>
        </Stack>
        <Stack justifyContent="end" direction="row" gap={0.6}>
          <Typography
            color="text.secondary"
            sx={{ fontSize: ButtonProps ? '13px' : null }}>
            Δb:
          </Typography>
          <Stack direction="row" gap={0.25}>
            <Typography
              sx={{ fontSize: ButtonProps ? '13px' : null }}
            >
              {poolState?.deltaB?.gte(0) ? '+' : ''}
              {displayBN(poolState?.deltaB, true)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
  
  return ButtonProps ? (
    <Button
      variant="outlined"
      color="secondary"
      sx={{
        display: 'block',
        color: '#000000',
        borderColor: '#c7ddf0',
        // '&:hover': {
        //   borderColor: '#d5e5f2',
        //   backgroundColor: 'transparent'
        // }
      }}
      {...ButtonProps}
    >
      {cardContent}
    </Button>
  ) : (
    <Card sx={{ p: 1, pr: 2, pl:2 }}>
      {cardContent}
    </Card>
  );
};

export default PoolCard;

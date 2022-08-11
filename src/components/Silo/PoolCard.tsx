import React from 'react';
import { Button, ButtonProps as MuiButtonProps, Card, LinkProps, Stack, Typography } from '@mui/material';
import { BeanPoolState } from '~/state/bean/pools';
import { displayBN, displayFullBN } from '~/util';
import { Pool } from '~/classes';
import TokenIcon from '~/components/Common/TokenIcon';
import { ZERO_BN } from '~/constants';

/**
 * Displays data about a Pool containing Beans and other assets.
 */
const PoolCard: React.FC<{
  pool: Pool;
  poolState: BeanPoolState;
  ButtonProps?: MuiButtonProps & LinkProps;
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
          {pool.tokens.map((token) => (
            <TokenIcon key={token.address} token={token} />
          ))}
        </Stack>
        <Typography sx={{ fontWeight: 600, pt: 0.2 }}>
          ${displayFullBN(poolState?.price || ZERO_BN, 4)}
        </Typography>
      </Stack>
      <Stack>
        <Stack justifyContent="end" direction="row" gap={0.6}>
          <Typography
            color="text.secondary"
            variant="bodySmall"
          >
            liquidity:
          </Typography>
          <Typography variant="bodySmall">
            ${displayBN(poolState?.liquidity || ZERO_BN)}
          </Typography>
        </Stack>
        <Stack justifyContent="end" direction="row" gap={0.6}>
          <Typography
            color="text.secondary"
            variant="bodySmall"
          >
            deltaB:
          </Typography>
          <Stack direction="row" gap={0.25}>
            <Typography variant="bodySmall">
              {poolState?.deltaB?.gte(0) ? '+' : ''}
              {displayBN(poolState?.deltaB || ZERO_BN, true)}
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
        height: 'auto', // FIXME
        display: 'block',
        color: '#000000',
        borderColor: '#c7ddf0',
      }}
      {...ButtonProps}
    >
      {cardContent}
    </Button>
  ) : (
    <Card sx={{ p: 1, pr: 2, pl: 2 }}>
      {cardContent}
    </Card>
  );
};

export default PoolCard;

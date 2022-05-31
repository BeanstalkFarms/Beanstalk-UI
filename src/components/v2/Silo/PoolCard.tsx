import React from 'react';
import { Button, Card, Stack, Typography } from '@mui/material';
import { BeanPoolState } from 'state/v2/bean/pools';
import { SupportedChainId } from 'constants/chains';
import { displayBN } from 'util/index';
import { BEAN } from 'constants/v2/tokens';
import { Pool } from 'classes';

const PoolCard: React.FC<{
  pool: Pool;
  poolState: BeanPoolState;
  isButton?: boolean;
}> = ({
  pool,
  poolState,
  isButton
}) => {
  const cardContent = (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack
        direction="row"
        gap={(isButton) ? 4 : 2}
        alignItems="center"
      >
        <img alt="" src={pool.logo} width="20px" />
        <Typography
          sx={{
            fontSize: (isButton) ? '19px' : '16px',
            fontWeight: (isButton) ? 500 : 700
          }}
        >
          ${displayBN(poolState?.price)}
        </Typography>
      </Stack>
      <Stack>
        <Stack justifyContent="end" direction="row" gap={0.5}>
          <Typography
            sx={{
              opacity: 0.7,
              fontSize: (isButton) ? '13px' : null
            }}>
            liquidity:
          </Typography>
          <Typography
            sx={{
              fontSize: (isButton) ? '13px' : null
            }}
          >
            ${displayBN(poolState?.liquidity)}
          </Typography>
        </Stack>
        <Stack justifyContent="end" direction="row" gap={0.5}>
          <Typography
            sx={{
              opacity: 0.7,
              fontSize: (isButton) ? '13px' : null
            }}>
            delta:
          </Typography>
          <Stack direction="row" gap={0.2}>
            <Typography
              sx={{
                fontSize: (isButton) ? '13px' : null
              }}
            >
              {poolState?.deltaB?.gte(0) ? '+' : '-'}
            </Typography>
            <Stack direction="row">
              <img
                alt=""
                src={BEAN[SupportedChainId.MAINNET].logo}
                width={(isButton) ? '8px' : '10px'}
              />
              <Typography
                sx={{
                  fontSize: (isButton) ? '13px' : null
                }}
              >
                {displayBN(poolState?.deltaB?.abs(), true)}
              </Typography>
            </Stack>

          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
  return (
    <>
      {
        (isButton) ? (
          <>
            <Button
              variant="outlined"
              disableRipple
              sx={{
                display: 'block',
                color: '#000000',
                borderColor: '#c7ddf0',
                '&:hover': {
                  borderColor: '#d5e5f2',
                  backgroundColor: 'transparent'
                }
              }}>
              {cardContent}
            </Button>
          </>
        ) : (
          <>
            <Card sx={{ p: 1, pl: 2, pr: 2 }}>
              {cardContent}
            </Card>
          </>
        )
      }
    </>
  );
};

export default PoolCard;

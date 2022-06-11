import React from 'react';
import BigNumber from 'bignumber.js';
import { Stack, Typography } from '@mui/material';
import { displayBN } from 'util/index';
import { BEAN } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import TokenIcon from '../Common/TokenIcon';

export type FertilizerTooltip = {
  name?: string;
  humidity: string;
  fertilizer: string;
  reward: any;
}

export const BUY_FERTILIZER: FertilizerTooltip = {
  name: 'buy-fertilizer',
  humidity: 'Humidity — interest rate earned for buying Fertilizer.',
  fertilizer: '1 FERT = 1 USDC put into the Barn Raise.',
  reward: 'The number of Beans left to be distributed to this Fertilizer.'
};

export const MY_FERTILIZER: FertilizerTooltip = {
  name: 'my-fertilizer',
  humidity: 'Humidity',
  fertilizer: '1 FERT = 1 USDC put into the Barn Raise.',
  reward: (fertilized: BigNumber, unfertilized: BigNumber) => ((
    <Stack width={200}>
      <Stack direction="row" justifyContent="space-between">
        <Typography>Fertilized:</Typography>
        <Stack direction="row" alignItems="center" gap={0.2}>
          <TokenIcon token={BEAN[SupportedChainId.MAINNET]} style={{ width: '14px' }} />
          <Typography>{displayBN(fertilized)}</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography>Unfertilized:</Typography>
        <Stack direction="row" alignItems="center" gap={0.2}>
          <TokenIcon token={BEAN[SupportedChainId.MAINNET]} style={{ width: '14px' }} />
          <Typography>{displayBN(unfertilized)}</Typography>
        </Stack>
      </Stack>
    </Stack>
  ))
};

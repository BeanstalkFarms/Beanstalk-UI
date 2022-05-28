import React from 'react';
import { Stack, Typography } from '@mui/material';
import { BEAN } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/index';
import FertilizerImage, { FertilizerState } from './FertilizerImage';

export type FertilizerData = {
  /** The amount of Fertilizer owned at this */
  amount: BigNumber;
  /** 
   * The Humidity at which this Fertilizer was purchased. 
   * Derived from the Season using hooks provided in `useHumidity`.
   */
  humidity: BigNumber;
  /** The amount of Beans remaining to be paid to this Fertilizer. */
  remaining: BigNumber;
  /** The percentage this Fertilizer has been paid back. */
  progress?: number;
}

const FertilizerItem : React.FC<{
  /** Fertilizer can be `unused` -> `active` -> `used`.  */
  state?: FertilizerState;
} & FertilizerData> = ({
  state,
  amount,
  humidity,
  remaining,
  progress,
}) => (
  <Stack rowGap={0.75}>
    <FertilizerImage state={state} />
    {amount.eq(0) ? (
      <Typography textAlign="center">x0</Typography>
    ) : (
      <Stack direction="column" rowGap={0.25}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">
            x{displayBN(amount)}
          </Typography>
          <Typography color="text.secondary">
            {displayBN(humidity.times(100))}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.primary">
            Remaining
          </Typography>
          <Typography color="text.primary" fontWeight="bold">
            <TokenIcon token={BEAN[SupportedChainId.MAINNET]} /> {displayBN(remaining)}
          </Typography>
        </Stack>
      </Stack>
    )}
  </Stack>
);

export default FertilizerItem;

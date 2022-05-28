import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import { BEAN } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/index';
import FertilizerImage, { FertilizerState } from './FertilizerImage';
import OpacityIcon from '@mui/icons-material/Opacity';

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
    <FertilizerImage state={state} progress={progress} />
    {amount.eq(0) ? (
      <Typography textAlign="center">x0</Typography>
    ) : (
      <Stack direction="column" rowGap={0.25}>
        <Stack direction="row" justifyContent="space-between">
          <Tooltip title="1 FERT represents 1 USDC entered into the Barn Raise." placement="left">
            <Typography color="text.secondary">
              {displayBN(amount)} FERT
            </Typography>
          </Tooltip>
          <Tooltip title="Humidity is the interest rate earned for buying Fertilizer." placement="right">
            <Typography color="text.secondary">
              <OpacityIcon sx={{ fontSize: 14 }} /> {displayBN(humidity.times(100))}%
            </Typography>
          </Tooltip>
        </Stack>
        <Tooltip title={"The Beans remaining to be distributed to this Fertilizer."} placement="bottom">
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.primary" fontWeight="bold">
              Remaining
            </Typography>
            <Typography color="text.primary" fontWeight="bold">
              <TokenIcon token={BEAN[SupportedChainId.MAINNET]} /> {displayBN(remaining)}
            </Typography>
          </Stack>
        </Tooltip>
      </Stack>
    )}
  </Stack>
);

export default FertilizerItem;

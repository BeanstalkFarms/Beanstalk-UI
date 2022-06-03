import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import { BEAN } from 'constants/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN } from 'util/index';
import OpacityIcon from '@mui/icons-material/Opacity';
import FertilizerImage, { FertilizerState } from './FertilizerImage';
import humidityIcon from 'img/humidity-icon.svg';

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
  /**  */
  isNew?: boolean;
} & FertilizerData> = ({
  state,
  isNew,
  amount,
  humidity,
  remaining,
  progress,
}) => (
  <Stack rowGap={0.75}>
    <FertilizerImage isNew={isNew} state={state} progress={progress} />
    {amount.eq(0) ? (
      <Typography textAlign="center">x0</Typography>
    ) : (
      <Stack direction="column" rowGap={0.25}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.primary" fontWeight="bold">
            Fertilizer Season
          </Typography>
          <Typography color="text.primary" fontWeight="bold">
            3476
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Tooltip title="1 FERT = 1 USDC put into the Barn Raise." placement="left">
            <Typography color="text.secondary">
              x{displayFullBN(amount, 0)}
            </Typography>
          </Tooltip>
          <Tooltip title="Humidity — interest rate earned for buying Fertilizer." placement="right">
            <Typography color="text.secondary">
              {/*<OpacityIcon sx={{ fontSize: 14 }} /> */}
              <Stack direction="row" gap={0.2} alignItems="center">
                <img alt="" src={humidityIcon} height="13px" />
                {displayBN(humidity.times(100))}%
              </Stack>
            </Typography>
          </Tooltip>
        </Stack>
        <Tooltip title="The Beans remaining to be distributed to this Fertilizer." placement="bottom">
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.primary" fontWeight="bold">
              {isNew ? 'Unfertilized Beans' : 'Remaining'}
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

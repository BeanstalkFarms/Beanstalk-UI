import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import { BEAN } from 'constants/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN } from 'util/index';
import humidityIcon from 'img/humidity-icon.svg';
import FertilizerImage, { FertilizerState } from './FertilizerImage';
import { FertilizerTooltip } from '../../../constants/FertilizerItemTooltips';

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
  season?: BigNumber;
}

const FertilizerItem: React.FC<{
  /** Fertilizer can be `unused` -> `active` -> `used`.  */
  state?: FertilizerState;
  /**  */
  isNew?: boolean;
  tooltip: FertilizerTooltip;
} & FertilizerData> =
  ({
     tooltip,
     state,
     isNew,
     amount,
     humidity,
     remaining,
     progress,
     season
   }) => {
    const fertilizedBeans = new BigNumber(0); // TODO: update this
    const unfertilizedBeans = amount.multipliedBy(humidity.plus(1));

    return (
      <Stack width="100%" alignItems="center" rowGap={0.75}>
        <FertilizerImage isNew={isNew} state={state} progress={progress} />
        {amount.eq(0) ? (
          <Typography textAlign="center">x0</Typography>
        ) : (
          <Stack width="100%" direction="column" rowGap={0.25}>
            {season && (
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
                  Fertilizer Season
                </Typography>
                <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
                  {displayBN(season)}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Tooltip title={tooltip.fertilizer} placement="left">
                <Typography sx={{ fontSize: '14px', opacity: 0.6 }} color="text.secondary">
                  x{displayFullBN(amount, 0)}
                </Typography>
              </Tooltip>
              <Tooltip title={tooltip.humidity} placement="right">
                {/* <OpacityIcon sx={{ fontSize: 14 }} /> */}
                <Stack direction="row" gap={0.2} alignItems="center">
                  <img alt="" src={humidityIcon} height="13px" />
                  <Typography sx={{ fontSize: '14px', opacity: 0.6 }} color="text.secondary">
                    {displayBN(humidity.times(100))}%
                  </Typography>
                </Stack>
              </Tooltip>
            </Stack>
            <Tooltip
              title={tooltip.name === 'my-fertilizer' ? tooltip.reward(fertilizedBeans, unfertilizedBeans) : tooltip.reward}
              placement="right">
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
                  {isNew ? 'Unfertilized Beans' : 'Remaining'}
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.2}>
                  <TokenIcon token={BEAN[SupportedChainId.MAINNET]} style={{ width: '14px' }} />
                  <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
                    {displayBN(remaining)}
                  </Typography>
                </Stack>
              </Stack>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    );
  };

export default FertilizerItem;

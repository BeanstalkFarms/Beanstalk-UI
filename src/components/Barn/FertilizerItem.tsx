import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import TokenIcon from '~/components/Common/TokenIcon';
import humidityIcon from '~/img/beanstalk/humidity-icon.svg';
import { displayBN, displayFullBN } from '~/util';
import { SPROUTS } from '~/constants/tokens';
import FertilizerImage, { FertilizerState } from './FertilizerImage';
import { FertilizerTooltip } from './FertilizerItemTooltips';

export type FertilizerData = {
  /**
   * The ID of this Fertilizer 1155 token.
   * Corresponds to the "BPF" (Beans per Fertilizer).
   * Humidity and BPF are linked, though not deterministically.
   * A subgraph query is required to match these up. Subgraph
   * support will be added during June. For now ID is fixed to
   * 6_000_000 and season to 6_074.
   */
  id?: BigNumber;
  /**
   * The amount of Fertilizer owned at this ID.
   */
  amount: BigNumber;
  /**
   * The Humidity at which this Fertilizer was bought.
   */
  humidity: BigNumber | undefined;
  /**
   * The amount of Beans remaining to be paid to this Fertilizer.
   */
  sprouts: BigNumber | undefined;
  /**
   * The amount of Beans remaining already paid to this Fertilizer.
   */
  rinsableSprouts?: BigNumber | undefined;
  /**
   * The percentage this Fertilizer has been paid back.
   */
  progress?: number;
  /**
   * The Season in which this Fertilizer was bought.
   */
  season?: BigNumber;
}

const FertilizerItem: React.FC<FertilizerData & {
  /**
   * Customize the Fertilizer image used.
   * Fertilizer can be `unused` -> `active` -> `used`.
   */
  state?: FertilizerState;
  /**
   * Change copy and animations when we're purchasing new FERT.
   */
  isNew?: boolean;
  /**
   * 
   */
  tooltip: FertilizerTooltip;
}> = ({
  id,
  amount,
  humidity,
  rinsableSprouts: fertilized,
  sprouts: unfertilized,
  progress,
  tooltip,
  state,
  isNew,
}) => (
  <Stack width="100%" alignItems="center" rowGap={0.75}>
    <FertilizerImage
      isNew={isNew}
      state={state}
      progress={progress}
      id={id}
      />
    {amount.eq(0) ? (
      <Typography textAlign="center">x0</Typography>
    ) : (
      <Stack width="100%" direction="column" rowGap={0.25}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: '14px', opacity: 0.6 }} color="text.secondary">
            x{displayFullBN(amount, 0)}
          </Typography>
          <Tooltip title={tooltip.humidity} placement="right">
            <Stack direction="row" gap={0.2} alignItems="center">
              <img alt="" src={humidityIcon} height="13px" />
              <Typography sx={{ fontSize: '14px', opacity: 0.6 }} color="text.secondary">
                {humidity ? `${humidity.times(100).toFixed(1)}%` : '---'}
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>
        <Tooltip
          title={tooltip.name === 'my-fertilizer' ? tooltip.reward(fertilized, unfertilized) : tooltip.reward}
          placement="right">
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
              Sprouts
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.2}>
              <TokenIcon token={SPROUTS} style={{ width: '14px' }} />
              <Typography sx={{ fontSize: '14px' }} color="text.primary" fontWeight="bold">
                {unfertilized ? displayBN(unfertilized) : '?'}
              </Typography>
            </Stack>
          </Stack>
        </Tooltip>
      </Stack>
      )}
  </Stack>
  );

export default FertilizerItem;

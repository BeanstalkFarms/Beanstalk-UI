import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { BeanstalkPalette } from '../App/muiTheme';
import FertilizerImage, { FertilizerState } from './FertilizerImage';
import { BEAN } from 'constants/v2/tokens';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/index';

export type FertilizerData = {
  amount: BigNumber;
  humidity: BigNumber;
  remaining: BigNumber;
}

const FertilizerItem : React.FC<{
  size?: number;
  state?: FertilizerState;
  progress?: number;
  data: FertilizerData;
}> = ({
  size = 200,
  state,
  progress,
  data,
}) => (
  <Stack rowGap={0.75}>
    <FertilizerImage
      state={state}
    />
    <Stack direction="column" rowGap={0.25}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="text.secondary">
          x{displayBN(data.amount)}
        </Typography>
        <Typography color="text.secondary">
          {displayBN(data.humidity.times(100))}%
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="text.primary">
          Remaining
        </Typography>
        <Typography color="text.primary" fontWeight="bold">
          <TokenIcon token={BEAN[SupportedChainId.MAINNET]} /> {displayBN(data.remaining)}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
);

export default FertilizerItem;

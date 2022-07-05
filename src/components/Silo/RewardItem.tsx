import { Typography, Tooltip, Box, Stack } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../util';
import { BeanstalkPalette } from '../App/muiTheme';

export type RewardItemProps = {
  title: string;
  amount: BigNumber;
  tooltip: string;
  isClaimable?: boolean;
}

const RewardItem: React.FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
  isClaimable
}) => (
  <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
    <Typography color={isClaimable ? 'gray' : BeanstalkPalette.lightishGrey}>
      <Stack direction="row" gap={0.3} alignItems="center">
        {title}
        <Tooltip title={tooltip} placement="top">
          <HelpOutlineIcon
            sx={{ color: isClaimable ? 'gray' : BeanstalkPalette.lightishGrey, fontSize: '13px' }}
          />
        </Tooltip>
      </Stack>
    </Typography>
    <Typography color={isClaimable ? BeanstalkPalette.black : BeanstalkPalette.lightishGrey} variant="h3">{displayFullBN(amount, 2)}</Typography>
  </Box>
);

export default RewardItem;

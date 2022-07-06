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
  icon?: any;
}

const RewardItem: React.FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
  isClaimable,
  icon
}) => (
  <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
    <Typography color={isClaimable === false ? BeanstalkPalette.lightishGrey : 'gray'}>
      <Stack direction="row" gap={0.3} alignItems="center">
        {title}
        <Tooltip title={tooltip} placement="top">
          <HelpOutlineIcon
            sx={{ color: isClaimable === false ? BeanstalkPalette.lightishGrey : 'gray', fontSize: '13px' }}
          />
        </Tooltip>
      </Stack>
    </Typography>
    <Stack direction="row" gap={0.3} alignItems="center">
      {icon && <img src={icon} alt="" height="17px" style={{ opacity: isClaimable === false ? 0.2 : 1 }} />}
      {amount && <Typography color={isClaimable === false ? BeanstalkPalette.lightishGrey : BeanstalkPalette.black} variant="h3">{displayFullBN(amount, 2)}</Typography>}
    </Stack>
  </Box>
);

export default RewardItem;

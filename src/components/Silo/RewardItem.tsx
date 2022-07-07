import { Typography, Tooltip, Box, Stack } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../util';

export type RewardItemProps = {
  title: string;
  amount: BigNumber;
  tooltip: string;
  icon?: string;
  /** If isClaimable === false, grey out the RewardItem. */
  isClaimable?: boolean;
}

const RewardItem: React.FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
  icon,
  isClaimable,
}) => (
  <Box sx={{ flex: { md: 'auto', xs: 1 }, opacity: isClaimable === false ? 0.2 : 1 }}>
    <Typography>
      <Stack direction="row" gap={0.3} alignItems="center">
        {title}
        <Tooltip title={tooltip} placement="top">
          <HelpOutlineIcon
            sx={{ fontSize: '13px' }}
          />
        </Tooltip>
      </Stack>
    </Typography>
    <Stack direction="row" gap={0.3} alignItems="center">
      {icon && <img src={icon} alt="" height="17px" />}
      {amount && <Typography variant="h3">{displayFullBN(amount, 2)}</Typography>}
    </Stack>
  </Box>
);

export default RewardItem;

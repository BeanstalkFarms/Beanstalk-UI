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
  /** */
  // eslint-disable-next-line
  compact?: boolean;
}

const RewardItem: React.FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
  icon,
  isClaimable,
}) => (
  <Box sx={{ flex: { lg: 'auto', xs: 1 }, opacity: isClaimable === false ? 0.2 : 1 }}>
    <Typography>
      {title}
      <Tooltip title={tooltip} placement="top">
        <HelpOutlineIcon
          sx={{ display: 'inline', mb: 0.5, fontSize: '11px' }}
        />
      </Tooltip>
    </Typography>
    <Stack direction="row" gap={0.4} alignItems="center">
      {icon && <img src={icon} alt="" height="17px" />}
      {amount && (
        <Typography variant="h3">{amount.lt(0) ? '-' : displayFullBN(amount, 2)}</Typography>
      )}
    </Stack>
  </Box>
);

export default RewardItem;

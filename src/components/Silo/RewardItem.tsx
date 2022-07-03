import { Typography, Tooltip, Box, Stack } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../util';

export type RewardItemProps = {
  title: string;
  amount: BigNumber;
  tooltip: string;
}

const RewardItem: React.FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
}) => (
  <Box sx={{ flex: { md: 'auto', xs: 1 } }}>
    <Typography color="gray">
      <Stack direction="row" gap={0.3} alignItems="center">
        {title}
        <Tooltip title={tooltip} placement="top">
          <HelpOutlineIcon
            sx={{ color: 'gray', fontSize: '13px' }}
          />
        </Tooltip>
      </Stack>
    </Typography>
    <Typography variant="h3">{displayFullBN(amount, 2)}</Typography>
  </Box>
);

export default RewardItem;

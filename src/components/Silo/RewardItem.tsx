import { Typography, Tooltip, Box } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import BigNumber from 'bignumber.js';
import { displayFullBN } from '../../util';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

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

const RewardItem: FC<RewardItemProps> = ({
  amount,
  tooltip,
  title,
  icon,
  isClaimable,
}) => (
  <Box sx={{ flex: { lg: 'auto', xs: 1 }, opacity: isClaimable === false ? 0.2 : 1 }}>
    <Tooltip title={tooltip} placement="top">
      <Typography>
        {title}
        <HelpOutlineIcon
          sx={{ display: 'inline', mb: 0.5, fontSize: '11px' }}
        />
      </Typography>
    </Tooltip>
    <Row gap={0.4}>
      {icon && <img src={icon} alt="" height="16px" />}
      {amount && (
        <Typography variant="h4">
          {amount.lt(0) ? '-' : displayFullBN(amount, 2)}
        </Typography>
      )}
    </Row>
  </Box>
);

export default RewardItem;

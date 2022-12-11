import { Stack } from '@mui/material';
import React from 'react';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS } from '~/constants/tokens';

import { FC } from '~/types';

type IProps = {
  size?: number;
  type: 'create' | 'cancel' | 'unknown' | 'buy' | 'sell'
}

const EntityIcon : FC<IProps> = ({ size = 25, type }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{
      backgroundColor: (
        ['fill listing', 'listing'].includes(type)
          ? BeanstalkPalette.mediumRed
          : BeanstalkPalette.mediumGreen
      ),
      width: size,
      height: size,
      p: 1,
      borderRadius: '50%'
    }}>
    <TokenIcon token={PODS} />
  </Stack>
);

export default EntityIcon;

import { Stack } from '@mui/material';
import React from 'react';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS } from '~/constants/tokens';

import { FC } from '~/types';

const EntityIcon : FC<{ size?: number, type: 'listing' | 'order' | 'create' | 'buy' | 'cancel' | 'unkonwn' | 'sell' }> = ({ size = 25, type }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{
      backgroundColor: (
        type === 'listing' || type === 'sell'
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

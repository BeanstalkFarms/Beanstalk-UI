import React from 'react';
import { StackProps } from '@mui/material';
import Row from '~/components/Common/Row';

import { FC } from '~/types';
import { BeanstalkPalette } from '~/components/App/muiTheme';

const OutputField : FC<{
  isNegative?: boolean;
  size?: 'small'
} & StackProps> = ({
  isNegative = false,
  children,
  sx,
  size,
  ...props
}) => (
  <Row
    sx={{
      // backgroundColor: isNegative ? '#FFE5DF' : '#F6FAFE',
      backgroundColor: BeanstalkPalette.lightestBlue, 
      borderRadius: 1,
      px: size === 'small' ? 1 : 2,
      py: size === 'small' ? 0.5 : 2,
      color: isNegative ? BeanstalkPalette.washedRed : 'inherit',
      height: size === 'small' ? '42px' : '70px',
      ...sx
    }}
    alignItems="center"
    justifyContent="space-between"
    {...props}
    >
    {children}
  </Row>
);

export default OutputField;

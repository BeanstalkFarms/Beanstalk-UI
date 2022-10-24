import { StackProps } from '@mui/material';
import React from 'react';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';

import { FC } from '~/types';

const OutputField : FC<{
  isNegative?: boolean;
} & StackProps> = ({
  //
  isNegative = false,
  children,
  //
  sx,
  ...props
}) => (
  <Row
    sx={{
      // backgroundColor: isNegative ? '#FFE5DF' : '#F6FAFE',
      backgroundColor: isNegative ? '#FFE5DF' : BeanstalkPalette.theme.fallDark.light,
      borderRadius: 1,
      px: 2,
      py: 2,
      color: isNegative ? 'hsla(12, 63%, 52%, 1)' : 'inherit',
      height: '70px',
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

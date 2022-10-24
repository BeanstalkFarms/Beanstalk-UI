import React from 'react';
import { Card, CardProps } from '@mui/material';

import { FC } from '~/types';
import { BeanstalkPalette } from '../App/muiTheme';

const EmbeddedCard: FC<CardProps> = ({ children, ...cardProps }) => (
  <Card 
    {...cardProps} 
    sx={{ 
      ...cardProps.sx, 
      borderWidth: '.5px !important', 
      borderRadius: '6px !important',
      background: BeanstalkPalette.theme.fallDark.light
    }}>
    {children}
  </Card>
);

export default EmbeddedCard;

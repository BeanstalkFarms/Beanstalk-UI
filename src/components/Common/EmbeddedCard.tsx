import React from 'react';
import { Card, CardProps } from '@mui/material';

const EmbeddedCard: React.FC<CardProps> = ({ children, ...cardProps }) => (
  <Card 
    {...cardProps} 
    sx={{ 
      ...cardProps.sx, 
      borderWidth: '.5px !important', 
      borderRadius: '6px !important',
    }}>
    {children}
  </Card>
);

export default EmbeddedCard;

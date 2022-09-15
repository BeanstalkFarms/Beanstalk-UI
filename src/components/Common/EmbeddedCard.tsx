import React from 'react';
import { Card, CardProps } from '@mui/material';

const EmbeddedCard: React.FC<CardProps> = ({ children, ...cardProps }) => (
  <Card {...cardProps} sx={{ borderWidth: '0.5px', borderRadius: '6px' }}>
    {children}
  </Card>
);

export default EmbeddedCard;

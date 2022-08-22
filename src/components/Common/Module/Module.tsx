import React from 'react';
import { Card, CardProps } from '@mui/material';

export const Module : React.FC<CardProps> = ({ children, ...props }) => (
  <Card sx={{ position: 'relative' }} {...props}>
    {children}
  </Card>    
);

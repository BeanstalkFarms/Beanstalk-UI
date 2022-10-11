import { Card, Typography } from '@mui/material';
import React from 'react';

const UserBalancesCharts : React.FC<{}> = ({
  children,
  ...props
}) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Typography variant="h4">Deposited Balance</Typography>
  </Card>
);

export default UserBalancesCharts;

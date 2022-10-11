import { Typography } from '@mui/material';
import React from 'react';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import BalancesOverTime from '~/components/Balances/BalancesOverTime';

const UserBalancesCharts : React.FC<{}> = ({
  children,
  ...props
}) => (
  <Module>
    <ModuleHeader>
      <Typography variant="h4">Deposited Balance</Typography>
    </ModuleHeader>
    <ModuleContent px={2} pb={2}>
      <BalancesOverTime />
    </ModuleContent>
  </Module>
);

export default UserBalancesCharts;

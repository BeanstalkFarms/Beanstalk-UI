import { Typography } from '@mui/material';
import React from 'react';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import EmbeddedCard from '~/components/Common/EmbeddedCard';

const UserBalancesCharts : React.FC<{}> = ({
  children,
  ...props
}) => (
  <Module>
    <ModuleHeader>
      <Typography variant="h4">Deposited Balance</Typography>
    </ModuleHeader>
    <ModuleContent px={2} pb={2}>
      <EmbeddedCard sx={{ pt: 2 }}>
        <Typography>Charts Here</Typography>
      </EmbeddedCard>
    </ModuleContent>
  </Module>
);

export default UserBalancesCharts;

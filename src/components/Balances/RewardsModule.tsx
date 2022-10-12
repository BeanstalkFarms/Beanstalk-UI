import { Typography } from '@mui/material';
import React from 'react';
import {
  Module,
  ModuleContent,
  ModuleHeader,
} from '~/components/Common/Module';

const RewardsModule: React.FC<{ children?: React.ReactNode }> = ({
  children,
  ...props
}) => (
  <Module sx={{ height: '100%' }}>
    <ModuleHeader>
      <Typography variant="h4">Rewards</Typography>
    </ModuleHeader>
    <ModuleContent px={2} pb={2}>
      <Typography>Rewards here</Typography>
    </ModuleContent>
  </Module>
);

export default RewardsModule;

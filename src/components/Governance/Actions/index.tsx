import React from 'react';
import { Typography } from '@mui/material';
import Vote from '~/components/Governance/Actions/Vote';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';

const GovernanceActions : React.FC = () => (
  <Module sx={{ position: 'sticky', top: 120 }}>
    <ModuleHeader>
      <Typography variant="h4">Results</Typography>
    </ModuleHeader>
    <ModuleContent>
      <Vote />
    </ModuleContent>
  </Module>
);

export default GovernanceActions;

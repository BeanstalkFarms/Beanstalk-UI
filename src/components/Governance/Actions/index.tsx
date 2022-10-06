import React from 'react';
import { Typography } from '@mui/material';
import Vote from '~/components/Governance/Actions/Vote';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import { Proposal } from '~/util/Governance';

import { FC } from '~/types';

const GovernanceActions : FC<{ proposal: Proposal }> = (props) => (
  <Module sx={{ position: 'sticky', top: 120 }}>
    <ModuleHeader>
      <Typography variant="h4">Results</Typography>
    </ModuleHeader>
    <ModuleContent>
      <Vote proposal={props.proposal} />
    </ModuleContent>
  </Module>
);

export default GovernanceActions;

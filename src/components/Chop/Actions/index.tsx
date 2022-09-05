import { Typography } from '@mui/material';
import React from 'react';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import Chop from './Chop';

const ChopActions : React.FC<{}> = () => (
  <Module>
    <ModuleHeader>
      <Typography variant="h4">Chop</Typography>
    </ModuleHeader>
    <ModuleContent>
      <BlurComponent>
        Chopping is temporarily disabled. Check Discord for more information.
      </BlurComponent>
      <Chop />
    </ModuleContent>
  </Module>
);

export default ChopActions;

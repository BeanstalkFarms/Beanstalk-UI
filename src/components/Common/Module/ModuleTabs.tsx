import { Tabs, TabsProps } from '@mui/material';
import React from 'react';
import { ModuleHeader } from '~/components/Common/Module';

export const ModuleTabs : React.FC<TabsProps> = ({ children, sx, ...props }) => (
  <ModuleHeader>
    <Tabs 
      sx={{ 
        overflow: 'visible',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Tabs>
  </ModuleHeader>
);

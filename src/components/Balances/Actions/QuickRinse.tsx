import { Typography, Box } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Rinse from '~/components/Barn/Actions/Rinse';
import { Module, ModuleContent, ModuleHeader } from '~/components/Common/Module';
import Row from '~/components/Common/Row';
import { AppState } from '~/state';

const QuickRinse: React.FC<{}> = () => {
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>((state) => state._farmer.barn);
  const rinsable = farmerBarn.fertilizedSprouts;

  return !rinsable?.eq(0) ? (
    <Module>
      <ModuleHeader>
        <Row spacing={0.5} width="100%">
          <Box 
            width="8px" 
            height="8px" 
            sx={{ 
                borderRadius: '50%', 
                background: BeanstalkPalette.theme.fall.brown
              }}
            />
          <Typography variant="h4">
            Quick Rinse
          </Typography>
        </Row>
      </ModuleHeader>
      <ModuleContent>
        <Rinse quick />
      </ModuleContent>
    </Module>
    ) : null;
};

export default QuickRinse;

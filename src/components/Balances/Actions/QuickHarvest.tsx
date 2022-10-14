import { Card, Stack, Typography, Box } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import Harvest from '~/components/Field/Actions/Harvest';
import { AppState } from '~/state';

const QuickHarvest: React.FC<{}> = () => {
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const harvestable = farmerField.harvestablePods;

  return harvestable?.gt(0) ? (
    <Card>
      <Stack spacing={1} sx={{ p: 2 }}>
        <Typography component="span" variant="h4">
          <Row>
            <Box 
              width="8px" 
              height="8px" 
              sx={{ 
                borderRadius: '50%', 
                background: BeanstalkPalette.theme.fall.brown
              }}
            />
            Quick Harvest
          </Row>
        </Typography>
        <Harvest isQuickHarvest />
      </Stack>
    </Card>
  ) : null;
};

export default QuickHarvest;

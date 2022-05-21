import { Box, Card } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const ForecastPage : React.FC = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(state => state._farmer.silo)
  return (
    <Box>
      <Card>
        <pre>{JSON.stringify(farmerSilo, null, 2)}</pre>
      </Card>
    </Box>
  )
};

export default ForecastPage;
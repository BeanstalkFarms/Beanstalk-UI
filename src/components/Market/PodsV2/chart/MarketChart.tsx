import { Box, CircularProgress, Typography } from '@mui/material';

import React from 'react';
import { Module, ModuleHeader } from '~/components/Common/Module';
import Centered from '~/components/Common/ZeroState/Centered';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketGraph from '../../Pods/MarketGraph';

const MarketChart: React.FC<{ chartHeight: string }> = ({ chartHeight }) => {
  const data = useMarketData();

  return (
    <Module>
      <ModuleHeader>
        <Typography variant="h4">Overview</Typography>
      </ModuleHeader>
      {!data.loading && data.listings && data.orders ? (
        <Box width="100%" sx={{ height: chartHeight }}>
          <MarketGraph
            listings={data.listings}
            orders={data.orders}
            maxPlaceInLine={data.maxPlaceInLine}
            maxPlotSize={data.maxPlotSize}
            harvestableIndex={data.harvestableIndex}
          />
        </Box>
      ) : (
        <Centered>
          <CircularProgress variant="indeterminate" />
        </Centered>
      )}
    </Module>
  );
};

export default MarketChart;

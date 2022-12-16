import { Box, CircularProgress } from '@mui/material';

import React from 'react';
import CondensedCard from '~/components/Common/Card/CondensedCard';

import Centered from '~/components/Common/ZeroState/Centered';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketGraph from '../../Pods/MarketGraph';

const MarketChart: React.FC<{ chartHeight: string }> = ({ chartHeight }) => {
  const data = useMarketData();

  return (
    <CondensedCard title="OVERVIEW" sx={{ height: '100%' }}>
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
        <Centered height="100%">
          <CircularProgress variant="indeterminate" />
        </Centered>
      )}
    </CondensedCard>
  );
};

export default MarketChart;

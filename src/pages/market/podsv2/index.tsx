import React, { useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { useAtom } from 'jotai';
import useNavHeight from '~/hooks/app/usePageDimensions';
import useBanner from '~/hooks/app/useBanner';
import MarketActionsV2 from '~/components/Market/PodsV2/MarketActionsV2';
import PodsMarketInfo, { sizes } from '~/components/Market/PodsV2/marketInfo';
import { Module, ModuleHeader } from '~/components/Common/Module';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketGraph from '~/components/Market/Pods/MarketGraph';
import Centered from '~/components/Common/ZeroState/Centered';
import { podsOrderActionTypeAtom } from '~/components/Market/PodsV2/info/atom-context';

const SECTION_MAX_WIDTH = 550;

const PodsMarketNew: React.FC<{}> = () => {
  const data = useMarketData();
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);

  // sizes & calculations
  const GAP = 0.8;
  const BOTTOM_HEIGHT = navHeight * 2.5;
  const CONTAINER_HEIGHT = `calc(100vh - ${BOTTOM_HEIGHT}px)`;
  const [accordionHeight, setAccordionHeight] = useState(sizes.CLOSED);
  const CHART_HEIGHT = `calc(100vh - ${(GAP * 10) + BOTTOM_HEIGHT + accordionHeight + 57}px)`;
  
  const [orderType, setOrderType] = useAtom(podsOrderActionTypeAtom);

  const handleSetOrderType = (_e: any, i: number) => {
    setOrderType(i);
  };

  return (
    <Stack
      px={1}
      mt={{ xs: 7, md: 0 }}
      direction={{ xs: 'column-reverse', md: 'row' }}
      justifyItems="stretch"
      width="100%"
      gap={GAP}
      sx={{ height: CONTAINER_HEIGHT }}
    >
      <Stack direction="column" width="100%" gap={GAP} justifyItems="stretch">
        <Module>
          <ModuleHeader>
            <Typography variant="h4">Overview</Typography>
          </ModuleHeader>
          <Box sx={{
            width: '100%',
            height: CHART_HEIGHT,
            position: 'relative',
            overflow: 'visible'
          }}>
            {!data.loading && data.listings !== undefined && data.orders !== undefined ? (
              <MarketGraph
                listings={data.listings}
                orders={data.orders}
                maxPlaceInLine={data.maxPlaceInLine}
                maxPlotSize={data.maxPlotSize}
                harvestableIndex={data.harvestableIndex}
              />
            ) : (
              <Centered>
                <CircularProgress variant="indeterminate" />
              </Centered>
            )}
          </Box>
        </Module>
        <Box height="fit-content">
          <PodsMarketInfo setHeight={setAccordionHeight} />
        </Box>
      </Stack>
      <Stack
        direction="column"
        sx={{ width: { xs: '100%', md: `${SECTION_MAX_WIDTH}px` }, height: '100%', overflow: 'auto' }}
        gap={GAP}>
        <MarketActionsV2 />
        {/* <Module sx={{ p: 2, height: '100%' }}> */}
        {/*  ORDERBOOK */}
        {/* </Module> */}
        {/* <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}> */}
        {/*  <Soon> */}
        {/*    <Typography textAlign="center" color="gray">Orderbook coming soon.</Typography> */}
        {/*  </Soon> */}
        {/* </Card> */}
        {/* <OrderBook /> */}
      </Stack>
    </Stack>
  );
};

export default PodsMarketNew;

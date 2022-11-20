import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import useNavHeight from '~/hooks/app/usePageDimensions';
import { FC } from '~/types';
import useBanner from '~/hooks/app/useBanner';
import BuySellPods from '~/components/Market/PodsV2/BuySellPods';
import PodsMarketInfo, { sizes } from '~/components/Market/PodsV2/marketInfo';
import { Module, ModuleHeader } from '~/components/Common/Module';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketGraph from '~/components/Market/Pods/MarketGraph';
import Centered from '~/components/Common/ZeroState/Centered';

const SECTION_MAX_WIDTH = 375;

const sx = {
  height: '100%',
  width: '100%',
};

const FullPageWrapper: FC<{}> = ({ children }) => {
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100vw',
        height: `calc(100vh - ${navHeight}px)`,
        // top: '-40px', // TODO: fix me
      }}
      id="full-page-wrapper"
    >
      <Box sx={{ ...sx, p: 1 }}>{children}</Box>
    </Box>
  );
};

const PodsMarketNew: React.FC<{}> = () => {
  const data = useMarketData();
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);

  const GAP = 0.8;
  const BOTTOM_HEIGHT = navHeight * 2.5;
  const CONTAINER_HEIGHT = `calc(100vh - ${BOTTOM_HEIGHT}px)`;
  const [accordionHeight, setAccordionHeight] = useState(sizes.CLOSED);
  const CHART_HEIGHT = `calc(100vh - ${(GAP * 10) + BOTTOM_HEIGHT + accordionHeight + 57}px)`;

  useEffect(() => {
    console.log('HEIGHT', accordionHeight);
  }, [accordionHeight]);

  console.log('ST: ', CHART_HEIGHT);

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
        {/* <Module sx={{ p: 2, height: '100%' }}> */}
        {/*  TEST */}
        {/* </Module> */}
        <Module>
          <ModuleHeader>
            <Typography variant="h4">Overview</Typography>
          </ModuleHeader>
          <Box sx={{
            width: '100%',
            // height: `calc(100vh - ${navHeight * 4.4}px)`,
            height: CHART_HEIGHT,
            // `calc(${CONTAINER_HEIGHT}px - ${GAP * 10}px - ${accordionHeight}px)`
            // height: '94%',
            position: 'relative',
            overflow: 'visible'
          }}>
            {data.loading === false && data.listings !== undefined && data.orders !== undefined ? (
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

      <Stack direction="column" sx={{ width: { xs: '100%', md: '375px' }, height: '100%' }} gap={GAP}>
        <BuySellPods />
        <Module sx={{ p: 2, height: '100%' }}>
          ORDERBOOK
        </Module>
      </Stack>
    </Stack>
    // <Stack
    //   px={1}
    //   gap={1}
    //   direction={{ xs: 'column-reverse', md: 'row' }}
    //   sx={{
    //     height: `calc(100vh - ${navHeight * 2.5}px)`,
    //     // maxHeight: `calc(100vh - ${navHeight * 2.5}px)`,
    //
    //   }}
    //   {...sx}
    // >
    //   <Stack sx={{ justifyContent: 'space-between' }} {...sx}>
    //     {/* <PodsChart /> */}
    //     {/**
    //      * Graph
    //      */}
    //     <Module sx={{ overflow: 'visible' }}>
    //       <ModuleHeader>
    //         <Typography variant="h4">Overview</Typography>
    //       </ModuleHeader>
    //       <Box sx={{ width: '100%', height: `calc(100vh - ${navHeight * 4.4}px)`, position: 'relative', overflow: 'visible' }}>
    //         {data.loading === false && data.listings !== undefined && data.orders !== undefined ? (
    //           <MarketGraph
    //             listings={data.listings}
    //             orders={data.orders}
    //             maxPlaceInLine={data.maxPlaceInLine}
    //             maxPlotSize={data.maxPlotSize}
    //             harvestableIndex={data.harvestableIndex}
    //           />
    //         ) : (
    //           <Centered>
    //             <CircularProgress variant="indeterminate" />
    //           </Centered>
    //         )}
    //       </Box>
    //     </Module>
    //     <PodsMarketInfo />
    //   </Stack>
    //   <Stack maxWidth={{ xs: 'none', md: SECTION_MAX_WIDTH }} {...sx} gap={1}>
    //     <BuySellPods />
    //     <OrderBook />
    //   </Stack>
    // </Stack>
  );
};

export default PodsMarketNew;

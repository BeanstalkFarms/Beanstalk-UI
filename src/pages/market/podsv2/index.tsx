import React, { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  ThemeProvider,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import useNavHeight from '~/hooks/app/usePageDimensions';
import useBanner from '~/hooks/app/useBanner';
import MarketActionsV2 from '~/components/Market/PodsV2/MarketActionsV2';
import MarketActivityV2, {
  sizes,
} from '~/components/Market/PodsV2/MarketActivityV2';
import MarketChart from '~/components/Market/PodsV2/chart/MarketChart';
import { muiThemeCondensed } from '~/components/App/muiTheme';

const SECTION_MAX_WIDTH = 400;
const GAP = 0.8;

const MarketPage: React.FC<{}> = () => {
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // sizes & calculations
  const BOTTOM_HEIGHT = navHeight + 35;
  const CONTAINER_HEIGHT = `calc(100vh - ${BOTTOM_HEIGHT}px)`;
  const [accordionHeight, setAccordionHeight] = useState(sizes.CLOSED);

  const chartHeight = useMemo(() => {
    if (isMobile) return '400px';
    return `calc(100vh - ${GAP * 10 + BOTTOM_HEIGHT + accordionHeight + 57}px)`;
  }, [BOTTOM_HEIGHT, accordionHeight, isMobile]);

  return (
    <Box py={1} sx={{ position: 'relative' }}>
      <Stack
        px={1}
        direction={{ xs: 'column', lg: 'row' }}
        width="100%"
        gap={1}
        sx={{ height: { xs: '100%', lg: CONTAINER_HEIGHT } }}
      >
        <Stack
          width={{ xs: '100%', lg: `calc(100% - ${SECTION_MAX_WIDTH}px)` }}
          gap={1}
          sx={{ boxSizing: 'border-box', height: '100%' }}
        >
          <Box>
            <MarketChart chartHeight={chartHeight} />
          </Box>
          <Box height="fit-content" display={{ xs: 'none', lg: 'block' }}>
            <MarketActivityV2 setHeight={setAccordionHeight} />
          </Box>
        </Stack>
        <Stack
          sx={{
            width: { xs: '100%', lg: `${SECTION_MAX_WIDTH}px` },
            height: '100%',
          }}
          gap={1}
        >
          <MarketActionsV2 />
          {/* <OrderBook /> */}
          <Box height="fit-content" display={{ xs: 'block', lg: 'none' }}>
            <MarketActivityV2 setHeight={setAccordionHeight} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

const PodMarketV2: React.FC<{}> = () => (
  <ThemeProvider theme={muiThemeCondensed}>
    <MarketPage />
  </ThemeProvider>
);

export default PodMarketV2;

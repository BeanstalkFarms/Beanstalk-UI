import React, { useMemo, useState } from 'react';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';

import useNavHeight from '~/hooks/app/usePageDimensions';
import useBanner from '~/hooks/app/useBanner';
import MarketActionsV2 from '~/components/Market/PodsV2/MarketActionsV2';
import MarketActivityV2, {
  sizes,
} from '~/components/Market/PodsV2/MarketActivityV2';
import OrderBook from '~/components/Market/PodsV2/OrderBook';
import MarketChart from '~/components/Market/PodsV2/chart/MarketChart';

const SECTION_MAX_WIDTH = 400;
const GAP = 0.8;

const PodsMarketNew: React.FC<{}> = () => {
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // sizes & calculations
  const BOTTOM_HEIGHT = navHeight * 2.5;
  const CONTAINER_HEIGHT = `calc(100vh - ${BOTTOM_HEIGHT}px)`;
  const [accordionHeight, setAccordionHeight] = useState(sizes.CLOSED);

  const chartHeight = useMemo(() => {
    if (isMobile) return '400px';
    return `calc(100vh - ${GAP * 10 + BOTTOM_HEIGHT + accordionHeight + 57}px)`;
  }, [BOTTOM_HEIGHT, accordionHeight, isMobile]);

  return (
    <Box py={0.8}>
      <Stack
        px={1}
        direction={{ xs: 'column', lg: 'row' }}
        width="100%"
        gap={GAP}
        sx={{ height: { xs: '100%', lg: CONTAINER_HEIGHT } }}
      >
        <Stack
          width={{ xs: '100%', lg: `calc(100% - ${SECTION_MAX_WIDTH}px)` }}
          gap={GAP}
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
          gap={GAP}
        >
          <MarketActionsV2 />
          <OrderBook />
          <Box height="fit-content" display={{ xs: 'block', lg: 'none' }}>
            <MarketActivityV2 setHeight={setAccordionHeight} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PodsMarketNew;

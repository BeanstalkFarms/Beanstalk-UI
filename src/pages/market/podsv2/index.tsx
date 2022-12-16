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
import MarketActionsV2 from '~/components/Market/PodsV2/Actions';
import MarketActivityV2, {
  sizes,
} from '~/components/Market/PodsV2/MarketActivityV2';
import MarketChart from '~/components/Market/PodsV2/chart/MarketChart';
import { muiThemeCondensed } from '~/components/App/muiTheme';

const SECTION_MAX_WIDTH = 375;
const GAP = 0.8;
const SPACING_SIZE = GAP * 10;
const LEFT_MAX_WIDTH = `calc(100% - ${SECTION_MAX_WIDTH}px - ${SPACING_SIZE}px)`;

/**
 * Lays out the structure of the market page.
 */
const MarketPage: React.FC<{}> = () => {
  const banner = useBanner();
  const navHeight = useNavHeight(!!banner);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // sizes & calculations
  const BOTTOM_HEIGHT = navHeight + 35;
  const [accordionHeight, setAccordionHeight] = useState(sizes.CLOSED);

  const chartHeight = useMemo(() => {
    if (isMobile) return '400px';
    return `calc(100vh - ${GAP * 10 + BOTTOM_HEIGHT + accordionHeight + 57}px)`;
  }, [BOTTOM_HEIGHT, accordionHeight, isMobile]);

  return (
    <Box p={1} width="100%" height="100%">
      <Stack gap={1}>
        <Stack direction={{ xs: 'column', lg: 'row' }} gap={1}>
          <Stack width={{ xs: '100%', lg: LEFT_MAX_WIDTH }}>
            <MarketChart chartHeight={chartHeight} />
          </Stack>
          <Stack
            height="100%"
            width={{ xs: '100%', lg: `${SECTION_MAX_WIDTH}px` }}
          >
            <MarketActionsV2 />
          </Stack>
        </Stack>
        <Stack width={{ xs: '100%', lg: LEFT_MAX_WIDTH }}>
          <MarketActivityV2 setHeight={setAccordionHeight} />
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

import React from 'react';
import { Box, Stack } from '@mui/material';
import useNavHeight from '~/hooks/app/usePageDimensions';
import { FC } from '~/types';
import useBanner from '~/hooks/app/useBanner';
import BuySellPods from '~/components/Market/PodsV2/BuySellPods';
import PodsMarketInfo from '~/components/Market/PodsV2/marketInfo';
import PodsChart from '~/components/Market/PodsV2/chart/podsChart';
import OrderBook from '~/components/Market/PodsV2/tables/OrderBook';

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

const PodsMarketNew: React.FC<{}> = () => (
  // <ThemeProvider theme={muiThemeCondensed}>
  <Box sx={{ px: 0.8 }}>
    <Stack direction={{ xs: 'column-reverse', md: 'row' }} {...sx} gap={1}>
      <Stack {...sx}>
        <PodsChart />
        <PodsMarketInfo />
      </Stack>
      <Stack maxWidth={{ xs: 'none', md: SECTION_MAX_WIDTH }} {...sx} gap={1}>
        <BuySellPods />
        <OrderBook />
      </Stack>
    </Stack>
  </Box>
  // </ThemeProvider>
);

export default PodsMarketNew;

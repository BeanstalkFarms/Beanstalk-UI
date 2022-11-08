import React from 'react';
import { Box, Stack } from '@mui/material';
import useNavHeight from '~/hooks/app/usePageDimensions';
import { FC } from '~/types';
import PodsChart from '~/components/Market/PodsV2/podsChart';
import PodsMarketInfo from '~/components/Market/PodsV2/marketInfo';
import useBanner from '~/hooks/app/useBanner';
import BuySellPods from '~/components/Market/PodsV2/BuySellPods';

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
        bottom: 0,
        height: `calc(100vh - ${navHeight}px)`,
      }}
    >
      <Box sx={{ ...sx, p: 1 }}>{children}</Box>
    </Box>
  );
};

const PodsMarketNew: React.FC<{}> = () => (
  <FullPageWrapper>
    <Stack direction="row" {...sx} gap={1}>
      <Stack {...sx}>
        <PodsChart />
        <PodsMarketInfo />
      </Stack>
      <Stack maxWidth={SECTION_MAX_WIDTH} {...sx} gap={1}>
        <BuySellPods />
        {/* <Orderbook /> */}
      </Stack>
    </Stack>
  </FullPageWrapper>
);

export default PodsMarketNew;

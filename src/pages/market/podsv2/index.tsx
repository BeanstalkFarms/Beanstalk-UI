import React from 'react';
import { Box, Stack } from '@mui/material';
import useNavHeight from '~/hooks/app/usePageDimensions';
import { FC } from '~/types';
import PodsChart from '~/components/Market/PodsV2/podsChart';
import PodsMarketInfo from '~/components/Market/PodsV2/marketInfo';
import useBanner from '~/hooks/app/useBanner';
import Orderbook from '~/components/Market/PodsV2/tables/orderbook';

const SECTION_MAX_WIDTH = 300;

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
      <Box sx={{ height: '100%', width: '100%', p: 1 }}>{children}</Box>
    </Box>
  );
};

const PodsMarketNew: React.FC<{}> = () => (
  <FullPageWrapper>
    <Stack direction="row" width="100%" height="100%" gap={1}>
      <Stack width="100%" height="100%">
        <PodsChart />
        <PodsMarketInfo />
      </Stack>
      <Stack maxWidth={SECTION_MAX_WIDTH} width="100%" height="100%" gap={1}>
        <Stack
          width="100%"
          maxHeight="500px"
          height="100%"
          sx={{ backgroundColor: 'red' }}
        >
          sup
        </Stack>
        <Orderbook />
      </Stack>
    </Stack>
  </FullPageWrapper>
);

export default PodsMarketNew;

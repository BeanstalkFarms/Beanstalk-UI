import React, { useCallback, useEffect, useState } from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useAtom } from 'jotai';

import useTabs from '~/hooks/display/useTabs';

import { FontSize, FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import { marketBottomTabsAtom } from './info/atom-context';
import DropdownIcon from '~/components/Common/DropdownIcon';
import MarketActivity from './tables/MarketActivity';
import FarmerMarketActivity from './tables/FarmerMarketActivity';

const sx = {
  tabs: {
    '&.MuiTab-root': {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.bold,
      '&.Mui-selected': {
        fontSize: FontSize.sm,
      },
    },
  },
  icons: {
    ':hover': { cursor: 'pointer' },
  },
};

export const sizes = {
  CLOSED: 56,
  HALF: 300,
  FULL: 750,
};

const MarketActivityV2: React.FC<{ setHeight: any }> = (props) => {
  const [tab, setTab] = useTabs();
  const [openState, setOpenState] = useAtom(marketBottomTabsAtom);
  const [size, setSize] = useState(sizes.CLOSED);

  useEffect(() => {
    const h =
      openState === 0
        ? sizes.CLOSED
        : openState === 1
        ? sizes.HALF
        : sizes.FULL;
    setSize(h);
    props.setHeight(h);
  }, [openState, props, size]);

  const openIfClosed = useCallback(() => {
    if (openState === 0) {
      setOpenState(1);
    }
  }, [openState, setOpenState]);

  return (
    <Stack
      sx={{
        position: 'relative',
        bottom: 0,
        height: `${size}px`,
        // FIXME: transition -> nice-to-have
        // transition: openState === 0 ? 'max-height 200ms ease-in' : null,
        // mt: openState !== 2 ? 1 : 0,
      }}
    >
      <Card sx={{ height: '100%', width: '100%' }}>
        <Stack height="100%" sx={{ overflow: 'hidden', visibility: 'visible' }}>
          <Row width="100%" justifyContent="space-between" p={1.2}>
            <Tabs value={tab} onChange={setTab}>
              <Tab label="Your Orders" sx={sx.tabs} onClick={openIfClosed} />
              <Tab label="Market Activity" sx={sx.tabs} onClick={openIfClosed} />
            </Tabs>
            <Row alignItems="center">
              <Box
                onClick={() => {
                  (openState === 0 || openState === 2) && setOpenState(1);
                  openState === 1 && setOpenState(0);
                }}
                sx={sx.icons}
              >
                <DropdownIcon open={openState !== 0} />
              </Box>
              <Box display={{ xs: 'none', md: 'block' }}>
                {openState === 1 && (
                  <FullscreenIcon
                    onClick={() => setOpenState(2)}
                    sx={sx.icons}
                  />
                )}
                {openState === 2 && (
                  <FullscreenExitIcon
                    onClick={() => setOpenState(1)}
                    sx={sx.icons}
                  />
                )}
              </Box>
            </Row>
          </Row>
          {openState !== 0 && tab === 0 && <FarmerMarketActivity />}
          {openState !== 0 && tab === 1 && <MarketActivity />}
        </Stack>
      </Card>
    </Stack>
  );
};

export default MarketActivityV2;

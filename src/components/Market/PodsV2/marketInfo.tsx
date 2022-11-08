import React from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useAtom } from 'jotai';

import useTabs from '~/hooks/display/useTabs';
import { POD_MARKET_COLUMNS } from './tables/activityTable';

import { FontSize, FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import { marketBottomTabsAtom } from './info/atom-context';
import DropdownIcon from '~/components/Common/DropdownIcon';
import YourPodOrders from './tables/YourPodOrders';
import MarketActivity from './tables/MarketActivity';

const COLS = POD_MARKET_COLUMNS;

export const podMarketActivityColumns: DataGridProps['columns'] = [
  COLS.date(2),
  COLS.action(1),
  COLS.type(1),
  COLS.priceType(1),
  COLS.price(1),
  COLS.amount(1),
  COLS.placeInLine(1),
  COLS.expiry(1),
  COLS.fillPct(1),
  COLS.total(1),
  COLS.status(1),
];

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

const PodsMarketInfo: React.FC<{}> = () => {
  const [tab, setTab] = useTabs();
  const [openState, setOpenState] = useAtom(marketBottomTabsAtom);

  return (
    <Stack
      sx={{
        position: 'relative',
        bottom: 0,
        height: '100%',
        maxHeight:
          openState === 0 ? '56px' : openState === 1 ? '300px' : '100%',
        transition: 'max-height 200ms ease-in',
        mt: openState !== 2 ? 1 : 0,
      }}
    >
      <Card sx={{ height: '100%', width: '100%' }}>
        <Stack height="100%" sx={{ overflow: 'hidden', visibility: 'visible' }}>
          <Row width="100%" justifyContent="space-between" p={1.2}>
            <Tabs
              value={tab}
              onChange={(e, i) => {
                setTab(e, i);
                openState === 0 && setOpenState(1);
              }}
            >
              <Tab label="Your Orders" sx={sx.tabs} />
              <Tab label="Market Activity" sx={sx.tabs} />
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
              <Box>
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
          {tab === 0 && <YourPodOrders />}
          {tab === 1 && <MarketActivity />}
        </Stack>
      </Card>
    </Stack>
  );
};

export default PodsMarketInfo;

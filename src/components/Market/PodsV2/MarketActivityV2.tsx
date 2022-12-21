import React, { useCallback } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useAtom, useAtomValue } from 'jotai';

import useTabs from '~/hooks/display/useTabs';

import { FontSize, FontWeight } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import {
  marketBottomTabsAtom,
  marketBottomTabsHeightAtom,
} from './info/atom-context';
import DropdownIcon from '~/components/Common/DropdownIcon';
import MarketActivity from './tables/MarketActivity';
import FarmerMarketActivity from './tables/FarmerMarketActivity';
import CondensedCard from '~/components/Common/Card/CondensedCard';
import AllListingsTable from './tables/AllListingsTable';
import OpenOrders from './tables/OpenOrders';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';
import useFarmerMarket from '~/hooks/farmer/market/useFarmerMarket';

const sx = {
  tabs: {
    '&.MuiTab-root': {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.bold,
      lineHeight: FontSize.sm,
      '&.Mui-selected': {
        fontSize: FontSize.sm,
      },
    },
  },
  icons: {
    ':hover': { cursor: 'pointer' },
  },
};

const MarketActivityV2: React.FC<{}> = () => {
  const [tab, setTab] = useTabs();
  const [openState, setOpenState] = useAtom(marketBottomTabsAtom);
  const size = useAtomValue(marketBottomTabsHeightAtom);

  // DATA
  // pull queries out of their respecitive hooks to avoid re-fetching
  const {
    data: eventsData,
    harvestableIndex,
    fetchMoreData,
  } = useMarketplaceEventData();
  const { data: farmerMarket } = useFarmerMarket();

  const openIfClosed = useCallback(() => {
    if (openState === 0) {
      setOpenState(1);
    }
  }, [openState, setOpenState]);

  return (
    <Stack
      sx={{
        bottom: 0,
        height: openState !== 0 ? `${size}px` : undefined,
        // FIXME: transition -> nice-to-have
        // transition: openState === 0 ? 'height 200ms ease-in' : null,
        // mt: openState !== 2 ? 1 : 0,
      }}
    >
      <CondensedCard
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}
        title={
          <Tabs value={tab} onChange={setTab}>
            <Tab label="BUY" sx={sx.tabs} onClick={openIfClosed} />
            <Tab label="SELL" sx={sx.tabs} onClick={openIfClosed} />
            <Tab label="YOUR ORDERS" sx={sx.tabs} onClick={openIfClosed} />
            <Tab label="MARKET ACTIVITY" sx={sx.tabs} onClick={openIfClosed} />
          </Tabs>
        }
        actions={
          <Row alignItems="center">
            <Stack
              onClick={() => {
                (openState === 0 || openState === 2) && setOpenState(1);
                openState === 1 && setOpenState(0);
              }}
              sx={sx.icons}
            >
              <DropdownIcon open={openState !== 0} />
            </Stack>
            <Stack display={{ xs: 'none', md: 'flex' }}>
              {openState === 1 && (
                <FullscreenIcon onClick={() => setOpenState(2)} sx={sx.icons} />
              )}
              {openState === 2 && (
                <FullscreenExitIcon
                  onClick={() => setOpenState(1)}
                  sx={sx.icons}
                />
              )}
            </Stack>
          </Row>
        }
      >
        <Stack height="100%">
          {openState !== 0 && tab === 0 && <AllListingsTable />}
          {openState !== 0 && tab === 1 && <OpenOrders />}
          {openState !== 0 && tab === 2 && (
            <FarmerMarketActivity
              data={farmerMarket}
              initializing={!farmerMarket.length || harvestableIndex.lte(0)}
            />
          )}
          {openState !== 0 && tab === 3 && (
            <MarketActivity
              data={eventsData}
              initializing={!eventsData.length || harvestableIndex.lte(0)}
              fetchMoreData={fetchMoreData}
            />
          )}
        </Stack>
      </CondensedCard>
    </Stack>
  );
};

export default MarketActivityV2;

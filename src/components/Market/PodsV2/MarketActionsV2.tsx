import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontSize } from '~/components/App/muiTheme';
import BuyPods from './forms/BuyPods';
import SellPods from './forms/SellPods';
import { PodOrderAction, podsOrderActionTypeAtom } from './info/atom-context';
import useTabs from '~/hooks/display/useTabs';

const tabSx = {
  '&.MuiTab-root': {
    fontSize: FontSize.sm,
    p: 0.5,
    mr: 0.5,
    '&.Mui-selected': {
      fontSize: FontSize.sm,
    },
  },
};

export const MARKET_SLUGS = ['buy', 'sell'];

const MarketActionsV2: React.FC<{}> = () => {
  const [orderType, setOrderType] = useAtom(podsOrderActionTypeAtom);
  const [_, handleChange] = useTabs(MARKET_SLUGS, 'action');

  const [params] = useSearchParams();
  const actionType = params.get('action');

  const handleSetOrderType = (_e: any, i: number) => {
    setOrderType(i);
    // Changes URL action param
    handleChange(_e, i);
  };

  return (
    <Card sx={{ width: '100%', overflow: 'visible', position: 'relative' }}>
      <Box p={1} sx={{ borderBottom: '0.5px solid', borderColor: 'divider' }}>
        <Tabs value={orderType} onChange={handleSetOrderType}>
          <Tab label="BUY" sx={tabSx} />
          <Tab label="SELL" sx={tabSx} />
        </Tabs>
      </Box>
      <Stack sx={{ width: '100%' }}>
        {orderType === PodOrderAction.BUY && <BuyPods />}
        {orderType === PodOrderAction.SELL && <SellPods />}
      </Stack>
    </Card>
  );
};

export default MarketActionsV2;

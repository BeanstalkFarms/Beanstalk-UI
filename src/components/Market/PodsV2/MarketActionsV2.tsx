import { Box, Card, Divider, Stack, Tab, Tabs } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontSize } from '~/components/App/muiTheme';
import BuyPods from './forms/BuyPods';
import SellPods from './forms/SellPods';
import { PodOrderAction, podsOrderActionTypeAtom } from './info/atom-context';
import useTabs from '~/hooks/display/useTabs';

const tabSX = {
  '&.MuiTab-root': {
    fontSize: FontSize.sm,
    mr: 0.8,
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
    <Card sx={{ width: '100%', overflow: 'visible' }}>
      <Box sx={{ p: 1.2 }}>
        <Tabs value={orderType} onChange={handleSetOrderType}>
          <Tab label="BUY" sx={tabSX} />
          <Tab label="SELL" sx={tabSX} />
        </Tabs>
      </Box>
      <Divider />
      <Stack sx={{ width: '100%' }}>
        {orderType === PodOrderAction.BUY && <BuyPods />}
        {orderType === PodOrderAction.SELL && <SellPods />}
      </Stack>
    </Card>
  );
};

export default MarketActionsV2;

/*
fill listing -> I buy pods that are for sale by another
fill order -> I sell pods that are desired by another

create listing -> I want to sell pods
create order -> I want to buy pods
*/

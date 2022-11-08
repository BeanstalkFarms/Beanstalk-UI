import { Box, Card, Divider, Tab, Tabs } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';
import BuyPods from './forms/BuyPods';
import SellPods from './forms/SellPods';
import { PodOrderAction, podsOrderActionTypeAtom } from './info/atom-context';

const sx = {
  tabs: {
    '&.MuiTab-root': {
      fontSize: FontSize.sm,
      '&.Mui-selected': {
        fontSize: FontSize.sm,
      },
    },
  },
};

const BuySellPods: React.FC<{}> = () => {
  const [orderType, setOrderType] = useAtom(podsOrderActionTypeAtom);

  return (
    <Card sx={{ width: '100%' }}>
      <Box sx={{ p: 1.2 }}>
        <Tabs
          value={orderType}
          onChange={(_, i) => {
            setOrderType(i);
          }}
        >
          <Tab label="Buy" sx={sx.tabs} />
          <Tab label="Sell" sx={sx.tabs} />
        </Tabs>
      </Box>
      <Divider />
      <Box sx={{ height: '100%', width: '100%' }}>
        {orderType === PodOrderAction.BUY && <BuyPods />}
        {orderType === PodOrderAction.SELL && <SellPods />}
      </Box>
    </Card>
  );
};

export default BuySellPods;

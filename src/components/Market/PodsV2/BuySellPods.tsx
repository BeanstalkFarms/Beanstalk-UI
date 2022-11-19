import { Box, Card, Divider, Stack, Tab, Tabs } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';
import BuyPods from './forms/BuyPods';
import SellPods from './forms/SellPods';
import { PodOrderAction, podsOrderActionTypeAtom } from './info/atom-context';

const tabSX = {
  '&.MuiTab-root': {
    fontSize: FontSize.sm,
    mr: 0.8,
    '&.Mui-selected': {
      fontSize: FontSize.sm,
    },
  },
};

const BuySellPods: React.FC<{}> = () => {
  const [orderType, setOrderType] = useAtom(podsOrderActionTypeAtom);

  const handleSetOrderType = (_e: any, i: number) => {
    setOrderType(i);
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

export default BuySellPods;
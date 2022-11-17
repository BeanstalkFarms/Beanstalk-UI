import { Box, Card, Divider, Stack, Tab, Tabs } from '@mui/material';
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
      mr: 0.8,
      '&.Mui-selected': {
        fontSize: FontSize.sm,
      },
    },
  },
};

const BuySellPods: React.FC<{}> = () => {
  const [orderType, setOrderType] = useAtom(podsOrderActionTypeAtom);

  const handleSetOrderType = (_e: any, i: number) => {
    setOrderType(i);
  };

  return (
    <Card sx={{ width: '100%' }}>
      <Box sx={{ p: 1.5 }}>
        <Tabs value={orderType} onChange={handleSetOrderType}>
          <Tab label="BUY" sx={sx.tabs} />
          <Tab label="SELL" sx={sx.tabs} />
        </Tabs>
      </Box>
      <Divider />
      <Stack sx={{ height: '100%', width: '100%' }}>
        {orderType === PodOrderAction.BUY && <BuyPods />}
        {orderType === PodOrderAction.SELL && <SellPods />}
      </Stack>
    </Card>
  );
};

export default BuySellPods;

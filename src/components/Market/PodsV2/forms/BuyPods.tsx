import { Divider, Stack } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import SubActionSelect from '../common/SubActionSelect';
import SubmitMarketAction from '../common/SubmitMarketAction';
import { PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import CreateBuyOrder from './CreateBuyOrder';
import FillSellOrder from './FillSellOrder';

const BuyPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }} gap={1.6}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        <Stack px={0.4}>
          {/* create buy order */}
          {orderType === PodOrderType.ORDER && <CreateBuyOrder />}
          {orderType === PodOrderType.FILL && <FillSellOrder />}
        </Stack>
      </Stack>
      <Divider />
      {/* submit buy order */}
      <Stack p={0.8}>
        <SubmitMarketAction />
      </Stack>
    </Stack>
  );
};

export default BuyPods;

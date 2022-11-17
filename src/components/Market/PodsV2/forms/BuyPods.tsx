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
      <Stack p={1}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {/* create buy order */}
        {orderType === PodOrderType.ORDER && <CreateBuyOrder />}
        {/* fill sell order */}
        {orderType === PodOrderType.FILL && <FillSellOrder />}
      </Stack>
      <Divider />
      {/* submit buy order */}
      <Stack p={1}>
        <SubmitMarketAction />
      </Stack>
    </Stack>
  );
};

export default BuyPods;

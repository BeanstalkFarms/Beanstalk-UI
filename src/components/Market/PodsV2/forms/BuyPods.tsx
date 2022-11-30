import { Divider, Stack } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import SubActionSelect from '../common/SubActionSelect';
import SubmitMarketAction from '../common/SubmitMarketAction';
import { PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import FillSellOrder from './FillSellOrder';
import CreateOrderV2 from '~/components/Market/PodsV2/Actions/CreateOrderV2';

const BuyPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {/* create buy order */}
        {/* {orderType === PodOrderType.ORDER && <CreateBuyOrder />} */}
        {orderType === PodOrderType.ORDER && <CreateOrderV2 />}
        {/* fill sell order */}
        {orderType === PodOrderType.FILL && <FillSellOrder />}
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

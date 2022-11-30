import { Stack,  Divider } from '@mui/material';
import {  useAtomValue } from 'jotai';
import React from 'react';
import SubActionSelect from '../common/SubActionSelect';
import {
 PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import SubmitMarketAction from '../common/SubmitMarketAction';
import CreateListingV2 from '~/components/Market/PodsV2/Actions/CreateListingV2';
import FillBuyListing from '~/components/Market/PodsV2/forms/FillBuyListing';

const SellPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {/* create buy order */}
        {/* {orderType === PodOrderType.ORDER && <CreateBuyOrder />} */}
        {orderType === PodOrderType.LIST && <CreateListingV2 />}
        {/* fill sell order */}
        {orderType === PodOrderType.FILL && <FillBuyListing />}
      </Stack>
      <Divider />
      {/* submit buy order */}
      <Stack p={0.8}>
        <SubmitMarketAction />
      </Stack>
    </Stack>
  );
};

export default SellPods;

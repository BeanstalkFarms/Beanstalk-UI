import { Stack, Typography } from '@mui/material';
import {  useAtomValue } from 'jotai';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import SubActionSelect from '../common/SubActionSelect';
import {
 PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import CreateListingV2 from '~/components/Market/PodsV2/Actions/CreateListingV2';
import Soon from '~/components/Common/ZeroState/Soon';

const SellPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);
  const { orderID } = useParams<{ orderID: string }>();

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }} gap={1}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {/* create buy order */}
        {/* {orderType === PodOrderType.ORDER && <CreateBuyOrder />} */}
        {orderType === PodOrderType.LIST && <CreateListingV2 />}
        {/* fill sell order */}
        {/* {orderType === PodOrderType.FILL && <FillBuyListing />} */}
        {orderType === PodOrderType.FILL && (
          <>
            {orderID ? (
              <Outlet />
            ) : (
              <Soon>
                <Typography textAlign="center" color="gray">Select a pod order on the chart to sell to.</Typography>
              </Soon>
            )}
          </>
        )}
      </Stack>
      {/* <Divider /> */}
      {/* submit buy order */}
      {/* <Stack p={0.8}> */}
      {/*  <SubmitMarketAction /> */}
      {/* </Stack> */}
    </Stack>
  );
};

export default SellPods;

import { Stack, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import SubActionSelect from '../common/SubActionSelect';
import { PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import CreateOrderV2 from '~/components/Market/PodsV2/Actions/CreateOrderV2';
import Soon from '~/components/Common/ZeroState/Soon';

const BuyPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);
  const { listingID } = useParams<{ listingID: string }>();

  return (
    <Stack>
      <Stack sx={{ p: 0.8 }} gap={1}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {/* create buy order */}
        {/* {orderType === PodOrderType.ORDER && <CreateBuyOrder />} */}
        {orderType === PodOrderType.ORDER && <CreateOrderV2 />}
        {/* fill sell order */}
        {/* {orderType === PodOrderType.FILL && <FillSellOrder />} */}
        {orderType === PodOrderType.FILL && (
          <>
            {listingID ? (
              <Outlet />
            ) : (
              <Soon>
                <Typography textAlign="center" color="gray">Select a pod listing on the chart to buy from.</Typography>
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

export default BuyPods;

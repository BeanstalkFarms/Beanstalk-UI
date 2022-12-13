import { Stack, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import SubActionSelect from '../common/SubActionSelect';
import { PodOrderType, podsOrderTypeAtom } from '../info/atom-context';
import Soon from '~/components/Common/ZeroState/Soon';
import CreateOrderV2 from '~/components/Market/PodsV2/Actions/CreateOrderV2';
import usePodListing from '~/hooks/beanstalk/usePodListing';
import StatHorizontal from '~/components/Common/StatHorizontal';
import { displayBN, displayFullBN } from '~/util';
import { BEAN, PODS } from '~/constants/tokens';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';

const BuyPods: React.FC<{}> = () => {
  const orderType = useAtomValue(podsOrderTypeAtom);
  const { listingID } = useParams<{ listingID: string }>();
  const { data: listing } = usePodListing(listingID);

  return (
    <Stack>
      <Stack p={1} gap={1}>
        {/* buy or sell toggle */}
        <SubActionSelect />
        {listing && orderType === PodOrderType.FILL && (
          <>
            <StatHorizontal label="Place in Line">
              {displayBN(listing.placeInLine)}
            </StatHorizontal>
            <StatHorizontal label="Price per Pod">
              <Row gap={0.25}>
                <TokenIcon token={BEAN[1]} />{' '}
                {displayFullBN(listing.pricePerPod, 4, 2)}
              </Row>
            </StatHorizontal>
            <StatHorizontal label="Amount">
              <Row gap={0.25}>
                <TokenIcon token={PODS} />{' '}
                {displayFullBN(listing.remainingAmount, 2, 0)}
              </Row>
            </StatHorizontal>
          </>
        )}
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
                <Typography textAlign="center" color="gray">
                  Select a pod listing on the chart to buy from.
                </Typography>
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

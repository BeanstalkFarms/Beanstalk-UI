import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import ActivityTable from './activityTable';
import { AppState } from '~/state';
import { POD_MARKET_COLUMNS } from './market-activity-columns';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';
import useFarmerMarketplaceEvents from '~/hooks/farmer/useFarmerMarketplaceEvents';
import useFarmerMarket from '~/hooks/farmer/useFarmerMarket';

const C = POD_MARKET_COLUMNS;
const columns = [
  C.date(1.5),
  C.action(0.9),
  C.type(0.9),
  C.priceType(1),
  C.pricePerPod(1),
  C.numPodsActive(1, 'left'),
  C.placeInLine(1, 'left'),
  C.expiry(1),
  C.fillPct(0.5),
  C.total(1),
  C.status(1, 'right'),
];

const FarmerMarketActivity: React.FC<{}> = () => {
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>(
    (state) => state._farmer.market.orders
  );
  const listings = useSelector<
    AppState,
    AppState['_farmer']['market']['listings']
  >((state) => state._farmer.market.listings);

  const { data: farmerMarket } = useFarmerMarket();

  console.debug('orders: ', orders);
  console.debug('listings: ', listings);

  const data = useFarmerMarketplaceEvents();
  const harvestableIndex = useHarvestableIndex();
  const isLoading = data.length === 0 || harvestableIndex.lte(0);

  const rows = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        idx: i,
      })),
    [data]
  );

  return (
    <ActivityTable
      columns={columns}
      rows={rows}
      loading={isLoading}
      getRowId={(row) => row.idx}
      isUserTable
      title="Orders and Listings"
    />
  );
};

export default FarmerMarketActivity;

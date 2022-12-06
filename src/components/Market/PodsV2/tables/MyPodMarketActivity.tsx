import React from 'react';
import { useSelector } from 'react-redux';
import ActivityTable from './activityTable';
import { useFakePodMarketActivity } from '../info/fake-data';
import { podMarketActivityColumns } from '../marketInfo';
import { AppState } from '~/state';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';

const MyPodMarketActivity: React.FC<{}> = () => {
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>(
    (state) => state._farmer.market.orders
  );
  const listings = useSelector<
    AppState,
    AppState['_farmer']['market']['listings']
  >((state) => state._farmer.market.listings);

  const { data, harvestableIndex, loading, fetchMoreData, fetchWithIds } =
    useMarketplaceEventData();

  const rows = useFakePodMarketActivity();

  return (
    <ActivityTable
      columns={podMarketActivityColumns}
      rows={rows}
      getRowId={(row) => row.id}
    />
  );
};

export default MyPodMarketActivity;

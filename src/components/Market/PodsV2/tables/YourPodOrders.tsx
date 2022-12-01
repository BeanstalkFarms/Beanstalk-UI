import React from 'react';
import ActivityTable from './activityTable';
import { useFakePodMarketActivity } from '../info/fake-data';
import { podMarketActivityColumns } from '../marketInfo';

const YourPodOrders: React.FC<{}> = () => {
  const rows = useFakePodMarketActivity();

  return (
    <ActivityTable
      columns={podMarketActivityColumns}
      rows={rows}
      loading={false}
      getRowId={(row) => row.id}
    />
  );
};

export default YourPodOrders;

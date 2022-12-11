import React, { useMemo } from 'react';
import ActivityTable from './activityTable';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';
import { POD_MARKET_COLUMNS } from './market-activity-columns';

const C = POD_MARKET_COLUMNS;

const columns = [
  C.date(1.5),
  C.action(1),
  C.entity(1),
  C.pricePerPod(1),
  C.numPods(1),
  C.activityPlaceInLine(1),
  C.total(0.75, 'left'),
];

const MarketActivity: React.FC<{}> = () => {
  const { data, harvestableIndex, fetchMoreData } = useMarketplaceEventData();

  // map row data to have index due to duplicated ids causing rendering issues
  const rows = useMemo(() => {
    if (!data || !data.length) return [];
    return data.map((r, i) => ({
      idx: i,
      ...r,
    }));
  }, [data]);

  const isInitializing = rows.length === 0 || harvestableIndex.lte(0);

  return (
    <ActivityTable
      loading={isInitializing}
      fetchMore={fetchMoreData}
      columns={columns}
      rows={rows}
      getRowId={(row) => row.idx}
    />
  );
};

export default MarketActivity;

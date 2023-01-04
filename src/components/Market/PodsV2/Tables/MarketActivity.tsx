import React, { useMemo } from 'react';
import BaseTable from './BaseTable';
import { MARKET_ACTIVITY_COLUMNS } from './columns/market-activity-columns';
import { MarketEvent } from '~/hooks/beanstalk/useMarketActivityData';

const C = MARKET_ACTIVITY_COLUMNS;

const columns = [
  C.date(1.5),
  C.action(1),
  C.entity(1),
  C.pricePerPod(1),
  C.numPods(1),
  C.activityPlaceInLine(1),
  C.total(0.75, 'left'),
];

const MarketActivity: React.FC<{
  data: MarketEvent[] | undefined;
  initializing: boolean;
  fetchMoreData: () => Promise<void>;
}> = ({ data, initializing, fetchMoreData }) => {
  const rows = useMemo(() => (!data || !data.length ? [] : data), [data]);

  return (
    <BaseTable
      rows={rows}
      columns={columns}
      loading={initializing}
      fetchMore={fetchMoreData}
      getRowId={(row) => row.id}
    />
  );
};

export default MarketActivity;
import React, { useMemo } from 'react';
import BaseTable from './BaseTable';
import { MARKET_ACTIVITY_COLUMNS } from './columns/market-activity-columns';
import { MarketEvent } from '~/hooks/beanstalk/useMarketActivityData';

const columns = [
  MARKET_ACTIVITY_COLUMNS.createdAt(1.5),
  MARKET_ACTIVITY_COLUMNS.labelAction(1),
  MARKET_ACTIVITY_COLUMNS.labelEntity(1),
  MARKET_ACTIVITY_COLUMNS.pricePerPod(1),
  MARKET_ACTIVITY_COLUMNS.amountPods(1),
  MARKET_ACTIVITY_COLUMNS.activityPlaceInLine(1),
  MARKET_ACTIVITY_COLUMNS.amountBeans(0.75, 'left'),
];

/**
 * Displays a table of all activity on the Market, including:
 * 
 * Order, Listings
 * Create, Fill, Cancel
 */
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

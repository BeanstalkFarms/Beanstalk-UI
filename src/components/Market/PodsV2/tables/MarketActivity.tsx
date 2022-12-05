import React, { useMemo, useRef } from 'react';
import ActivityTable, { POD_MARKET_COLUMNS } from './activityTable';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';

const C = POD_MARKET_COLUMNS;

const columns = [
  C.date(1.5),
  C.action(1),
  C.entity(1),
  C.price(1),
  C.amount(1),
  C.placeInLine(1),
  C.total(0.75, 'right'),
];

const MarketActivity: React.FC<{}> = () => {
  const { data, harvestableIndex, loading, fetchMoreData } =
    useMarketplaceEventData();

  const rows = useMemo(() => {
    if (!data || loading) return [];
    return data.filter((d) => d.time);
  }, [data, loading]);

  const initializing = data.length === 0 || harvestableIndex.lte(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <ActivityTable
      scrollRef={scrollRef}
      tableId="market-activity"
      initializing={initializing}
      fetchMore={fetchMoreData}
      columns={columns}
      rows={rows}
      loading={false}
      getRowId={(row) => row.id}
    />
  );
};

export default MarketActivity;

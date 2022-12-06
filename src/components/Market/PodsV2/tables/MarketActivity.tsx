import React, { useMemo } from 'react';
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

  // map row data to have index due to duplicated ids causing rendering issues
  const rows = useMemo(() => {
    if (!data) return [];
    const _rows = data.filter((d) => d.time);
    return _rows.map((r, i) => ({
      idx: i,
      ...r,
    }));
  }, [data]);

  return (
    <ActivityTable
      fetchMore={fetchMoreData}
      columns={columns}
      rows={rows}
      getRowId={(row) => row.idx}
    />
  );
};

export default MarketActivity;

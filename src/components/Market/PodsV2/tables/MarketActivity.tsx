import React, { useMemo } from 'react';
import ActivityTable from './activityTable';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';
import { POD_MARKET_COLUMNS } from './market-v2-columns';

const C = POD_MARKET_COLUMNS;

const columns = [
  C.date(1.5),
  C.action(1),
  C.entity(1),
  C.price(1),
  C.amount(1),
  C.placeInLine(1),
  C.total(0.75, 'left'),
];

const MarketActivity: React.FC<{}> = () => {
  const { data, harvestableIndex, fetchMoreData } =
    useMarketplaceEventData();

  // map row data to have index due to duplicated ids causing rendering issues
  const rows = useMemo(() => {
    if (!data || !data.length) return [];
    // const _rows = data.filter((d) => d.time);
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

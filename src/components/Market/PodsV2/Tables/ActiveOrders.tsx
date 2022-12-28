import React from 'react';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import BaseTable from './BaseTable';
import { MARKET_ACTIVITY_COLUMNS } from './columns/market-activity-columns';
import MARKET_COLUMNS from './columns/market-columns';

const columns = [
  MARKET_ACTIVITY_COLUMNS.date(1, 'left', 'CREATED AT'),
  //
  MARKET_COLUMNS.orderId(1, 'left'),
  // maxPlaceInLine
  MARKET_COLUMNS.maxPlaceInLine(1, 'left'),
  // pricePerPod
  MARKET_COLUMNS.pricePerPod(1, 'left'),
  // totalAmount
  MARKET_COLUMNS.numPods(1, 'right'),
];

const ActiveOrders: React.FC<{
  data: ReturnType<typeof useMarketData>;
}> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <BaseTable
      columns={columns}
      rows={data.orders || []}
      loading={data.loading}
      getRowId={(row) => `${row.account}-${row.id}`}
      onRowClick={({ row }) => {
        navigate(`/market/sell/${row.id}`);
      }}
    />
  );
};

export default ActiveOrders;

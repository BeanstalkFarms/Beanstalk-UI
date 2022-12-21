import React from 'react';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketTable from './marketTable';
import COLUMNS from './columns/market-columns';

const columns = [
  COLUMNS.orderId(1, 'left'),
  // maxPlaceInLine
  COLUMNS.maxPlaceInLine(1, 'left'),
  // pricePerPod
  COLUMNS.pricePerPod(1, 'left'),
  // totalAmount
  COLUMNS.numPods(1, 'right'),
];

const ActiveOrders: React.FC<{
  data: ReturnType<typeof useMarketData>;
}> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <MarketTable
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

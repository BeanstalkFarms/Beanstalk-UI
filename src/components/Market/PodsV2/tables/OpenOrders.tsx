import React from 'react';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import MarketTable from './marketTable';
import COLUMNS from './columns/orders-columns';

const columns = [
  COLUMNS.orderId(1, 'left'),
  COLUMNS.maxPlaceInLine(1, 'left'),
  COLUMNS.pricePerPod(1, 'left'),
  COLUMNS.numPods(1, 'right'),
];

const OpenOrders: React.FC<{}> = () => {
  const data = useMarketData();
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

export default OpenOrders;

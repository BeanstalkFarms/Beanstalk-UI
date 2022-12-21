import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import COLUMNS from './columns/listings-columns';
import MarketTable from './marketTable';
import { PodListing } from '~/state/farmer/market';

const AllListingsTable: React.FC<{}> = () => {
  const data = useMarketData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
        COLUMNS.listingId(1.3, 'left'),
        // index
        COLUMNS.plotIndex(data.harvestableIndex, 1, 'left'),
        // pricePerPod
        COLUMNS.pricePerPod(1, 'left'),
        // amount
        COLUMNS.numPodsActive(1, 'left'),
        // maxHarvestableIndex
        COLUMNS.expiry(data.harvestableIndex, 1, 'right'),
      ]
    : [
        COLUMNS.listingId(0.7, 'left'),
        // index
        COLUMNS.plotIndex(data.harvestableIndex, 1, 'left'),
        // pricePerPod
        COLUMNS.pricePerPod(1, 'left'),
        // amount
        COLUMNS.numPodsActive(1, 'right'),
      ];

  return (
    <MarketTable
      columns={columns}
      rows={data.listings || []}
      loading={data.loading}
      getRowId={(row: PodListing) => `${row.account}-${row.id}`}
      onRowClick={({ row }) => {
        console.log('row: ', row);
        navigate(`/market/buy/${row.id.toString()}`);
      }}
    />
  );
};

export default AllListingsTable;

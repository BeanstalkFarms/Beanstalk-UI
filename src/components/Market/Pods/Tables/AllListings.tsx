import React, { useCallback } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import COLUMNS from '~/components/Common/Table/cells';
import { PodListing } from '~/state/farmer/market';
import MarketBaseTable from './Base';
import useMarketData from '~/hooks/beanstalk/useMarketData';

const AllListings : React.FC<{ data: ReturnType<typeof useMarketData> }> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id.toString()}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.listingId(1.3),
      // index
      COLUMNS.plotIndex(data.harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
      // maxHarvestableIndex
      COLUMNS.expiry(data.harvestableIndex, 1),
      // other
      COLUMNS.rightChevron
    ]
    : [
      COLUMNS.listingId(0.7),
      // index
      COLUMNS.plotIndex(data.harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
    ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={data.listings || []}
      loading={data.loading}
      maxRows={8}
      onRowClick={handleClick}
      getRowId={(row : PodListing) => `${row.account}-${row.id}`}
    />
  );
};

export default AllListings;

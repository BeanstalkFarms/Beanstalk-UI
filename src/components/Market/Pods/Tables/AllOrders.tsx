import React, { useCallback } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import COLUMNS from '~/components/Common/Table/cells';
import { PodOrder } from '~/state/farmer/market';
import MarketBaseTable from './Base';
import useMarketData from '~/hooks/beanstalk/useMarketData';

const AllListings : React.FC<{ data: ReturnType<typeof useMarketData> }> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/pods/order/${params.row.id.toString()}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.orderId(1),
      COLUMNS.maxPlaceInLine(1),
      COLUMNS.pricePerPod(1),
      COLUMNS.numPods(1),
      COLUMNS.rightChevron
    ]
    : [
      COLUMNS.orderId(0.75),
      COLUMNS.maxPlaceInLine(1.8),
      COLUMNS.pricePerPod(1.5),
      COLUMNS.numPods(1.5),
    ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={data.orders || []}
      loading={data.loading}
      maxRows={8}
      onRowClick={handleClick}
      getRowId={(row : PodOrder) => row.id.toString()} // pod order ids are unique by default
    />
  );
};

export default AllListings;

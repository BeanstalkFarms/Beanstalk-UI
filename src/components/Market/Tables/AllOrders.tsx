import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import COLUMNS from '~/components/Common/Table/cells';
import { castPodOrder, PodOrder } from '~/state/farmer/market';
import { useAllPodOrdersQuery } from '~/generated/graphql';
import MarketBaseTable from './Base';

const AllListings : React.FC<{}> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  /// Data
  const { data, loading } = useAllPodOrdersQuery({
    variables: { first: 1000, },
    fetchPolicy: 'cache-and-network',
  });
  const rows : PodOrder[] = useMemo(() => {
    if (loading || !data?.podOrders) return [];
    return data.podOrders.map<PodOrder>(castPodOrder);
  }, [data?.podOrders, loading]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/order/${params.row.id.toString()}`);
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
      rows={rows}
      loading={loading}
      maxRows={8}
      onRowClick={handleClick}
      getRowId={(row : PodOrder) => row.id.toString()} // pod order ids are unique by default
    />
  );
};

export default AllListings;

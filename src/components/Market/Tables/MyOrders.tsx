import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import COLUMNS from '~/components/Common/Table/cells';
import MarketBaseTable from './Base';
import AuthEmptyState from '../../Common/ZeroState/AuthEmptyState';
import TablePagination from '../../Common/TablePagination';
import { AppState } from '~/state';

const components = {
  NoRowsOverlay() {
    return (
      <AuthEmptyState message="Your Orders will appear here.">
        <Button component={Link} to="/market/create" variant="contained" color="primary">
          Create Order
        </Button>
      </AuthEmptyState>
    );
  },
  Pagination: TablePagination,
};

const MyOrdersTable : React.FC<{}> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  /// Data
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>((state) => state._farmer.market.orders);
  const rows   = useMemo(() => Object.values(orders),   [orders]);

  console.debug('Orders', orders);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/order/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.orderId(1),
      COLUMNS.maxPlaceInLine(1),
      COLUMNS.pricePerPod(1),
      COLUMNS.numPodsActive(1),
      COLUMNS.progress,
      // FIXME: add cancel
      COLUMNS.rightChevron,
    ]
    : [
      COLUMNS.orderId(0.25),
      COLUMNS.maxPlaceInLine(1.8),
      COLUMNS.pricePerPod(1.5),
      COLUMNS.numPods(1.5),
    ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={rows}
      maxRows={8}
      onRowClick={handleClick}
      components={components}
    />
  );
};

export default MyOrdersTable;

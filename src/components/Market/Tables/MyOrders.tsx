import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from '~/state';
import { Link, useNavigate } from 'react-router-dom';
import COLUMNS from '~/components/Common/Table/cells';
import { Button } from '@mui/material';
import MarketBaseTable from './Base';
import AuthEmptyState from '../../Common/ZeroState/AuthEmptyState';
import TablePagination from '../../Common/TablePagination';

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
  const columns: DataGridProps['columns'] = [
    COLUMNS.orderId,
    COLUMNS.maxPlaceInLine,
    COLUMNS.pricePerPod,
    COLUMNS.numPodsActive,
    COLUMNS.progress,
    // FIXME: add cancel
    COLUMNS.rightChevron,
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

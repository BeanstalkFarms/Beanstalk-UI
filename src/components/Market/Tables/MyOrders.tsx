import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useNavigate } from 'react-router-dom';
import COLUMNS from 'components/Common/Table/cells';
import useHarvestableIndex from 'hooks/redux/useHarvestableIndex';
import MarketBaseTable from './Base';

const MyOrdersTable : React.FC<{}> = () => {
  /// Data
  const harvestableIndex = useHarvestableIndex();
  const orders = useSelector<AppState, AppState['_farmer']['market']['orders']>((state) => state._farmer.market.orders);
  const rows   = useMemo(() => Object.values(orders),   [orders]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/order/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = [
    // COLUMNS.connectedAccount,
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
    />
  );
};

export default MyOrdersTable;

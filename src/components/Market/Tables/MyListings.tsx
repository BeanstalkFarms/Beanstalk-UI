import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useNavigate } from 'react-router-dom';
import COLUMNS from 'components/Common/Table/cells';
import MarketBaseTable from './Base';
import TableEmptyState from '../../Common/TableEmptyState';
import useAccount from '../../../hooks/ledger/useAccount';

const MyListingsTable : React.FC<{}> = () => {
  const account = useAccount();
  const authState = !account ? 'disconnected' : 'ready';
  /// Data
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const listings       = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);
  const rows           = useMemo(() => Object.values(listings),   [listings]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = [
    // COLUMNS.connectedAccount,
    // // COLUMNS.status(beanstalkField.harvestableIndex),
    COLUMNS.plotIndex(beanstalkField.harvestableIndex),
    COLUMNS.pricePerPod,
    COLUMNS.numPodsActive,
    COLUMNS.expiry(beanstalkField.harvestableIndex),
    COLUMNS.progress,
    COLUMNS.rightChevron,
  ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={rows}
      maxRows={8}
      onRowClick={handleClick}
      components={{
        NoRowsOverlay() {
          return (
            <TableEmptyState title="Listings" state={authState} />
          );
        },
      }}
    />
  );
};

export default MyListingsTable;

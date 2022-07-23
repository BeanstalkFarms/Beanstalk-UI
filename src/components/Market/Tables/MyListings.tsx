import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useNavigate } from 'react-router-dom';
import COLUMNS from 'components/Common/Table/cells';
import MarketBaseTable from './Base';

const MyListingsTable : React.FC<{}> = () => {
  /// Data
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const listings         = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);
  const rows           = useMemo(() => Object.values(listings),   [listings]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = [
    COLUMNS.status(beanstalkField.harvestableIndex),
    COLUMNS.placeInLine(beanstalkField.harvestableIndex, {
      field: 'index',
      range: false
    }),
    COLUMNS.pricePerPod,
    COLUMNS.numPods,
    COLUMNS.expiry(beanstalkField.harvestableIndex),
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

export default MyListingsTable;

import React, { useCallback, useMemo } from 'react';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import COLUMNS from '~/components/Common/Table/cells';
import MarketBaseTable from './Base';
import AuthEmptyState from '../../../Common/ZeroState/AuthEmptyState';
import ArrowPagination from '../../../Common/ArrowPagination';
import { AppState } from '~/state';

import { FC } from '~/types';

const components = {
  NoRowsOverlay() {
    return (
      <AuthEmptyState message="You Listings will appear here." />
    );
  },
  Pagination: ArrowPagination,
};

const MyListingsTable : FC<{}> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /// Data
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const listings       = useSelector<AppState, AppState['_farmer']['market']['listings']>((state) => state._farmer.market.listings);
  const rows           = useMemo(() => Object.values(listings), [listings]);

  /// Navigation
  const navigate = useNavigate();
  const handleClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id}`);
  }, [navigate]);

  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.listingId(1),
      COLUMNS.plotIndex(beanstalkField.harvestableIndex, 1),
      COLUMNS.pricePerPod(1),
      COLUMNS.numPodsActive(1),
      COLUMNS.expiry(beanstalkField.harvestableIndex, 1),
      COLUMNS.progress,
      COLUMNS.rightChevron,
    ]
    : [
      COLUMNS.listingId(0.7),
      COLUMNS.plotIndex(beanstalkField.harvestableIndex, 1),
      COLUMNS.pricePerPod(1),
      COLUMNS.numPodsActive(1),
    ];
  
  return (
    <MarketBaseTable
      columns={columns}
      rows={rows}
      maxRows={8}
      onRowClick={handleClick}
      disableVirtualization={rows.length === 0}
      components={components}
    />
  );
};

export default MyListingsTable;

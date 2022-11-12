import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import ArrowPagination from '../../../Common/ArrowPagination';

import { FC } from '~/types';

const marketplaceTableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    '& .MuiDataGrid-row.odd': {
      backgroundColor: '#F6FAFE'
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none'
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 500,
      fontSize: FontSize.base
    },
    '& .MuiDataGrid-columnHeader:focus': {
      outline: 'none',
      border: 'none',
      outlineColor: 'transparent'
    },
    '& .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none',
      border: 'none',
      outlineColor: 'transparent'
    },
    '& .MuiDataGrid-columnHeaderDraggableContainer:focus': {
      outline: 'none'
    },
    '& .MuiDataGrid-cellContent': {
      color: '#677166',
      fontSize: '18px'
    },
    '& .MuiDataGrid-cell': {
      outline: 'none',
      border: 'none',
      '&:focused': {
        border: 'none'
      }
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
      border: 'none',
    },
    '& .MuiDataGrid-row': {
      border: 1,
      borderColor: BeanstalkPalette.blue,
      borderRadius: 1,
      py: 2.4,
      mb: 0.8,
      alignItems: 'center',
      cursor: 'pointer',
      width: 'calc(100% - 2.5px)',
      '&:hover': {
        background: BeanstalkPalette.lightestBlue
      }
    },
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
      justifyContent: 'center'
    },
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: 'none',
      fontSize: '18px',
      color: 'text.tertiary'
    },
    '& .MuiDataGrid-virtualScrollerRenderZone :hover': {
      // backgroundColor: 'transparent',
      // backgroundColor: '#D8F2DB'
    },
  }
};

const MAX_ROWS = 5;

export type MarketBaseTableProps = {
  maxRows?: number;
}

const MarketBaseTable: FC<
  MarketBaseTableProps & 
  DataGridProps
> = ({
  rows,
  columns,
  maxRows,
  onRowClick,
  ...props
}) => {
  ///
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '300px';
    return 39 + 58 + Math.min(rows.length, maxRows || MAX_ROWS) * 58;
  }, [rows, maxRows]);

  return (
    <Box sx={{
      height: tableHeight,
      width: '100%',
      ...marketplaceTableStyle,
    }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={maxRows || MAX_ROWS}
        disableSelectionOnClick
        // disableColumnMenu
        density="compact"
        onRowClick={onRowClick}
        initialState={{
          sorting: {
            sortModel: [{ field: 'placeInLine', sort: 'asc' }],
          }
        }}
        components={{
          Pagination: ArrowPagination
        }}
        {...props}
      />
    </Box>
  );
};

export default MarketBaseTable;

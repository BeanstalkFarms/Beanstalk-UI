import React, { useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { BeanstalkPalette, FontSize } from 'components/App/muiTheme';

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
      outline: 'none'
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
      borderColor: BeanstalkPalette.lightBlue,
      borderRadius: 1,
      py: 2.4,
      mb: 0.8,
      alignItems: 'center',
      cursor: 'pointer',
      width: 'calc(100% - 2.5px)',
      '&:hover': {
        background: BeanstalkPalette.hoverBlue
      }
    },
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: 'none',
      fontSize: '18px',
      color: '#000000'
    },
    '& .MuiDataGrid-virtualScrollerRenderZone :hover': {
      // backgroundColor: "transparent"
      // backgroundColor: "#D8F2DB"
    }
  }
};
const MAX_ROWS = 5;

export type BuySellTableProps = {
  hideHeader?: boolean;
  maxRows?: number;
}

const PlotTable: React.FC<BuySellTableProps & DataGridProps & BoxProps> = ({ rows, columns, maxRows, onRowClick }) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    if (maxRows !== undefined) return maxRows * 56 + 112;
    return MAX_ROWS * 56 + 112;
  }, [rows, maxRows]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Box
        sx={{
          height: tableHeight,
          width: '100%',
          ...marketplaceTableStyle,
        }}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          pageSize={maxRows !== undefined ? maxRows : MAX_ROWS}
          disableSelectionOnClick
          density="compact"
          onRowClick={onRowClick !== undefined ? onRowClick : () => {}}
          initialState={{
            sorting: {
              sortModel: [{ field: 'placeInLine', sort: 'asc' }],
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default PlotTable;

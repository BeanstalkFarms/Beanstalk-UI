import React, { useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { marketplaceTableStyle } from '../../util/marketplaceTableStyle';

const MAX_ROWS = 5;

export type BuySellTableProps = {
  hideHeader?: boolean;
}

const BuySellTable: React.FC<BuySellTableProps & DataGridProps & BoxProps> = ({ rows, columns, hideHeader }) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 61 + 112;
  }, [rows]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Box
        sx={{
          height: tableHeight,
          width: '100%',
          ...marketplaceTableStyle,
          '& .MuiDataGrid-columnHeaders': {
            display: hideHeader ? 'none' : null,
          },
          '& .MuiDataGrid-virtualScroller': {
            marginTop: hideHeader ? '0!important' : null
          },
        }}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          pageSize={MAX_ROWS}
          disableSelectionOnClick
          density="compact"
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

export default BuySellTable;

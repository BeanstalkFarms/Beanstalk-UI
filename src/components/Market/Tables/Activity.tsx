import React, { useMemo } from 'react';
import { Box, BoxProps, Card, Typography } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { tableStyle } from '../../Common/Table/styles';
import TablePagination from '../../Common/TablePagination';

const MAX_ROWS = 10;

export type ActivityTableProps = {
  // hideHeader?: boolean;
}

const ActivityTable: React.FC<
  ActivityTableProps & 
  DataGridProps & 
  BoxProps
> = ({ rows, columns }) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 35 + 112;
  }, [rows]);

  return (
    <Card>
      <Box pt={2} px={2} pb={1.5}>
        <Typography variant="h4" sx={{ pb: 1 }}>Marketplace Activity</Typography>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="center" sx={{ px: 1, pb: 1 }}>
        <Box
          sx={{
            height: tableHeight,
            width: '100%',
            ...tableStyle
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
            components={{
              Pagination: TablePagination
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default ActivityTable;

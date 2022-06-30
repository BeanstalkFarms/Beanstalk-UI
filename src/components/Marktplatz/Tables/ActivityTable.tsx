import React, { useMemo } from 'react';
import { Box, BoxProps, Card } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { tableStyle } from '../../Common/Table/styles';

const MAX_ROWS = 10;

export type ActivityTableProps = {
  hideHeader?: boolean;
}

const ActivityTable: React.FC<ActivityTableProps & DataGridProps & BoxProps> = ({ rows, columns, hideHeader }) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 35 + 112;
  }, [rows]);

  return (
    <Card sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="center">
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
          />
        </Box>
      </Box>
    </Card>
  );
};

export default ActivityTable;

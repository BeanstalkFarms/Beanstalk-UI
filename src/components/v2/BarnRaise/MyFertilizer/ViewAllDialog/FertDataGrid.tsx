import React from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tableStyle } from '../../../../../util/tableStyle';

const columns = [
  {
    field: 'id',
    headerName: 'Season',
    width: 90
  },
  {
    field: 'numFertilizer',
    headerName: '# Fertilizer',
    width: 90
  },
  {
    field: 'humidity',
    headerName: 'Humidity',
    width: 90
  },
  {
    field: 'rewards',
    headerName: 'Received Rewards',
    width: 150
  },
  {
    field: 'owedBeans',
    headerName: 'Total Owed Beans',
    width: 150
  },
];

export interface FertDataGridProps {
  rows: any[];
}

const FertDataGrid: React.FC<FertDataGridProps> = ({ rows }) => (
  <>
    <Box sx={{ height: 375, width: '100%', ...tableStyle }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        />
    </Box>
  </>
  );

export default FertDataGrid;

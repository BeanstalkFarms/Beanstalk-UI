import React from 'react';
import { Typography } from '@mui/material';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import { displayBN } from 'util/index';

const basicCell = (params: GridRenderCellParams) => (
  <Typography>{params.formattedValue}</Typography>
);

const COLUMNS: { [key: string]: GridColumns[number] } = {
  //
  season: {
    field: 'season',
    flex: 1,
    headerName: 'Season',
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => displayBN(params.value),
    renderCell: basicCell,
    sortable: false,
  },
  seeds: {
    field: 'seeds',
    flex: 1,
    headerName: 'Seeds',
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => displayBN(params.value),
    renderCell: basicCell,
    sortable: false,
  },
};

export default COLUMNS;

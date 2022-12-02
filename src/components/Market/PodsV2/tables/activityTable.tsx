import React, {  useMemo } from 'react';
import { DataGrid, DataGridProps, GridColumns, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { displayFullBN } from '~/util';
import { FC } from '~/types';
import { MarketBaseTableProps } from '~/components/Common/Table/TabTable';
import ArrowPagination from '~/components/Common/ArrowPagination';
import { FontSize, FontWeight } from '~/components/App/muiTheme';

const marketplaceTableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
      justifyContent: 'center'
    },
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: 'none',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontSize: FontSize.xs,
      color: 'text.tertiary',
      fontWeight: FontWeight.normal,
    },
    '& .MuiDataGrid-cell': {
      fontSize: FontSize.xs,
      color: 'text.primary',
    }
  }
};

const basicCell = (params: GridRenderCellParams) => <>{params.formattedValue}</>;

const formatDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
});

const MAX_ROWS = 10;

export const POD_MARKET_COLUMNS = {
  date: (flex: number) => ({
    field: 'date',
    headerName: 'DATE',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{formatDate.format(params.value)}</>
    ),
  }) as GridColumns[number],

  action: (flex: number) => ({
    field: 'action',
    headerName: 'ACTION',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value.toString().toUpperCase()}</>
    )
  }) as GridColumns[number],

  type: (flex: number) => ({
    field: 'type',
    headerName: 'TYPE',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value.toString().toUpperCase()}</>
    ),
  }) as GridColumns[number],

  priceType: (flex: number) => ({
    field: 'priceType',
    headerName: 'PRICE TYPE',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value.toUpperCase()}</>
    ),
  }) as GridColumns[number],

  price: (flex: number) => ({
    field: 'price',
    headerName: 'PRICE',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => displayFullBN(params.value, 2),
    renderCell: (params: GridRenderCellParams) => basicCell(params),
  }) as GridColumns[number],

  amount: (flex: number) => ({
    field: 'amount',
    headerName: 'AMOUNT',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => displayFullBN(params.value, 2),
    renderCell: (params: GridRenderCellParams) => basicCell(params),
  }) as GridColumns[number],

  placeInLine: (flex: number) => ({
    field: 'placeInLine',
    headerName: 'PLACE IN LINE',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => displayFullBN(params.value, 2),
    renderCell: (params: GridRenderCellParams) => basicCell(params),
  }) as GridColumns[number],

  expiry: (flex: number) => ({
    field: 'expiry',
    headerName: 'EXPIRY',
    flex: flex,
    align: 'left',
    type: 'string',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value}</>
    ),
  }) as GridColumns[number],

  fillPct: (flex: number) => ({
    field: 'fillPct',
    headerName: 'FILL %',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => `${displayFullBN(params.value, 2)}%`,
    renderCell: (params: GridRenderCellParams) => basicCell(params),
  }) as GridColumns[number],

  total: (flex: number) => ({
    field: 'total',
    headerName: 'TOTAL',
    flex: flex,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => displayFullBN(params.value, 2),
    renderCell: (params: GridRenderCellParams) => basicCell(params),
  }) as GridColumns[number],

  status: (flex: number) => ({  
    field: 'status',
    headerName: 'STATUS',
    flex: flex,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value.toString().toUpperCase()}</>
    ),
  }) as GridColumns[number],
};

const ActivityTable: FC<MarketBaseTableProps & DataGridProps> = ({ rows, columns, maxRows, onRowClick, ...props }) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '300px';
    return 39 + 58 + Math.min(rows.length, maxRows || MAX_ROWS) * 58;
  }, [rows, maxRows]);

  return (
    <Box sx={{
      px: 0.2,
      height: tableHeight,
      width: '100%',
      ...marketplaceTableStyle,
    }}>
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={maxRows}
        density="compact"
        onRowClick={onRowClick}
        initialState={{
          sorting: {
            sortModel: [{ field: 'date', sort: 'asc' }],
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

export default ActivityTable;

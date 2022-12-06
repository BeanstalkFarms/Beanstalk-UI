import React from 'react';
import {
  GridColumns,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Box } from '@mui/material';
import { displayBN, displayFullBN } from '~/util';
import { ZERO_BN } from '~/constants';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN } from '~/constants/tokens';

const basicCell = (params: GridRenderCellParams) => (
  <>{params.formattedValue}</>
);

const formatDate = (value: string) => {
  const date = DateTime.fromMillis((Number(value) * 1000) as number);
  return date.toLocaleString({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const POD_MARKET_COLUMNS = {
  id: (flex: number) =>
    ({
      field: 'idx',
      headerName: 'ID',
      flex,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),
  date: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'time',
      headerName: 'DATE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        formatDate(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <>{params.formattedValue}</>
      ),
    } as GridColumns[number]),

  action: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'action',
      headerName: 'ACTION',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  type: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'type',
      headerName: 'TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  entity: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'entity',
      headerName: 'TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  priceType: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'priceType',
      headerName: 'PRICE TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toUpperCase()}</>
      ),
    } as GridColumns[number]),

  price: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'pricePerPod',
      headerName: 'PRICE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        displayBN(params.value || ZERO_BN),
      renderCell: (params: GridRenderCellParams) => basicCell(params),
    } as GridColumns[number]),

  amount: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'numPods',
      headerName: 'AMOUNT',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        displayFullBN(params.value, 2),
      renderCell: (params: GridRenderCellParams) => basicCell(params),
    } as GridColumns[number]),

  placeInLine: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'placeInPodline',
      headerName: 'PLACE IN LINE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),

  expiry: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'expiry',
      headerName: 'EXPIRY',
      flex: flex,
      align: align || 'left',
      type: 'string',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),

  fillPct: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'fillPct',
      headerName: 'FILL %',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        `${displayFullBN(params.value, 2)}%`,
      renderCell: (params: GridRenderCellParams) => basicCell(params),
    } as GridColumns[number]),

  total: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'totalBeans',
      headerName: 'TOTAL',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        displayBN(params.value || ZERO_BN),
      renderCell: (params: GridRenderCellParams) => (
        <Box display="inline-flex" sx={{ gap: 0.25, alignItems: 'center' }}>
          <TokenIcon token={BEAN[1]} />
          {basicCell(params)}
        </Box>
      ),
    } as GridColumns[number]),

  status: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'status',
      headerName: 'STATUS',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),
};

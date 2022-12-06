import React, { useMemo, useRef } from 'react';
import {
  DataGrid,
  DataGridProps,
  GridColumns,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { DateTime } from 'luxon';
import { displayBN, displayFullBN } from '~/util';
import { FC } from '~/types';
import { MarketBaseTableProps } from '~/components/Common/Table/TabTable';
import { FontSize, FontWeight } from '~/components/App/muiTheme';
import { ZERO_BN } from '~/constants';
import ScrollPaginationControl from '~/components/Common/ScrollPaginationControl';
import Centered from '~/components/Common/ZeroState/Centered';

const marketplaceTableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
      justifyContent: 'center',
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
    },
    '& .MuiDataGrid-sortIcon': {
      color: 'text.primary',
    },
    '& .MuiDataGrid-menuIconButton': {
      color: 'text.primary',
    },
    '& .MuiDataGrid-iconSeparator': {
      color: 'transparent',
    },
  },
};

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

const MAX_ROWS = 10;

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
      field: 'totalValue',
      headerName: 'TOTAL',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        `$${displayBN(params.value || ZERO_BN)}`,
      renderCell: (params: GridRenderCellParams) => basicCell(params),
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

const EmptyOverlay: React.FC<{}> = () => (
  <Centered>
    <CircularProgress />
  </Centered>
);

type IProps = {
  fetchMore?: () => void;
} & MarketBaseTableProps &
  DataGridProps;

const ActivityTable: FC<IProps> = ({
  rows,
  columns,
  maxRows,
  onRowClick,
  fetchMore,
  ...props
}) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '300px';
    const baseHeight =
      39 + 58 + Math.min(rows.length, maxRows || MAX_ROWS) * 58;
    return baseHeight;
  }, [rows, maxRows]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Box
        ref={scrollRef}
        sx={{
          px: 0.2,
          height: tableHeight,
          width: '100%',
          ...marketplaceTableStyle,
        }}
      >
        <DataGrid
          hideFooterSelectedRowCount
          aria-label="activity-table"
          columns={columns}
          rows={rows}
          pageSize={maxRows}
          density="compact"
          onRowClick={onRowClick}
          initialState={{
            sorting: {
              sortModel: [{ field: 'time', sort: 'asc' }],
            },
          }}
          components={{
            Footer: ScrollPaginationControl,
            NoRowsOverlay: EmptyOverlay,
          }}
          componentsProps={{
            footer: {
              scrollRef,
              handleFetchMore: fetchMore,
            },
          }}
          {...props}
        />
      </Box>
    </>
  );
};

export default ActivityTable;

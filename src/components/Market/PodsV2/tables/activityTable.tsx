import React, { useEffect, useMemo } from 'react';
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
import ArrowPagination from '~/components/Common/ArrowPagination';
import { FontSize, FontWeight } from '~/components/App/muiTheme';
import { ZERO_BN } from '~/constants';
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

type IProps = {
  tableId: string;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  initializing?: boolean;
  fetchMore?: () => void;
} & MarketBaseTableProps &
  DataGridProps;

const ActivityTable: FC<IProps> = ({
  tableId,
  scrollRef,
  rows,
  columns,
  maxRows,
  onRowClick,
  initializing,
  fetchMore,
  ...props
}) => {
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '300px';
    const baseHeight =
      39 + 58 + Math.min(rows.length, maxRows || MAX_ROWS) * 58;
    if (fetchMore) return baseHeight + 200;
    return baseHeight;
  }, [rows, maxRows, fetchMore]);

  useEffect(() => {
    const onScr = () => {
      console.log('scrolling...');
    };
    const virtualScroller = scrollRef?.current?.querySelector('.MuiDataGrid-virtualScroller');

    if (initializing) return;
    
    if (virtualScroller) {
      console.log('isRendered...');
      virtualScroller?.addEventListener('scroll', onScr);
    } else {
      console.log('isNotRendered...');
    }

    return () => {
      virtualScroller?.removeEventListener('scroll', onScr);
    };
  }, [scrollRef, initializing]);

  return initializing ? (
    <Centered>
      <CircularProgress />
    </Centered>
  ) : (
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
          aria-label="activity-table"
          columns={columns}
          rows={rows}
          pageSize={maxRows}
          density="compact"
          onRowClick={onRowClick}
          initialState={{
            sorting: {
              sortModel: [{ field: 'date', sort: 'asc' }],
            },
          }}
          components={{
            Pagination: ArrowPagination,
          }}
          {...props}
        />
      </Box>
    </>
  );
};

export default ActivityTable;

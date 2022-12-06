import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import {
  GridRenderCellParams,
  GridColumns,
  DataGrid,
  DataGridProps,
} from '@mui/x-data-grid';
import React, { useMemo, useState } from 'react';
import { FontSize, FontWeight } from '~/components/App/muiTheme';
import ArrowPagination from '~/components/Common/ArrowPagination';
import Row from '~/components/Common/Row';
import SelectionGroup from '~/components/Common/SingleSelectionGroup';
import useMarketDataWithPrecision, {
  OrderbookPrecision,
} from '~/hooks/beanstalk/useMarketDataWithPrecision';
import marketplaceTableStyle from '../common/tableStyles';

const orderbookTableStyle = {
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
  },
};

const percentOptions = ['0.01', '0.02', '0.03', '0.04', '0.05', '0.06'];

const OrderbookCols = {
  price: (flex: number) =>
    ({
      field: 'price',
      headerName: 'PRICE',
      flex: flex,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),
  depthBean: (flex: number) =>
    ({
      field: 'depth',
      headerName: 'DEPTH(BEAN)',
      flex: flex,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),
  maxPlaceInLineBuy: (flex: number) =>
    ({
      field: 'maxPlaceInLineBuy',
      headerName: 'MAX PLACE IN LINE (BUY)',
      flex: flex,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),

  minPlaceInLineSell: (flex: number) =>
    ({
      field: 'maxPlaceInLineSell',
      headerName: 'MAX PLACE IN LINE (SELL)',
      flex: flex,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),

  depthPods: (flex: number) =>
    ({
      field: 'depthPods',
      headerName: 'DEPTH(PODS)',
      flex: flex,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),
};

const useFakeOrders = () =>
  Array(250)
    .fill(null)
    .map((_, i) => ({
      id: i % 0.1,
      price: i,
      depthBean: i,
      maxPlaceInLineBuy: i,
      maxPlaceInLineSell: i,
      depthPods: i,
    }));

const precisionOptions: OrderbookPrecision[] = [0.01, 0.05, 0.1];

const OrderBook: React.FC<{}> = () => {
  const orders = useFakeOrders();
  const [precision, setPrecision] = useState<OrderbookPrecision>(
    precisionOptions[0]
  );

  const [numberFormat, setNumberFormat] = useState(0);
  const [percent, setPercent] = useState(percentOptions[0]);
  const data = useMarketDataWithPrecision(precision);

  const ROWS_PER_PAGE = 50;

  const tableHeight = useMemo(() => {
    if (!orders || orders.length === 0) return '300px';
    return 95 + Math.min(orders.length, 1) * 58;
  }, [orders]);

  // const tableHeight = useMemo(() => {
  //   if (!orders || orders.length === 0) return '300px';
  //   return 39 + 58 + Math.min(orders.length, 10) * 58;
  // }, [orders]);

  const cols: DataGridProps['columns'] = [
    OrderbookCols.price(1),
    OrderbookCols.depthBean(1),
    OrderbookCols.maxPlaceInLineBuy(1),
    OrderbookCols.minPlaceInLineSell(1),
    OrderbookCols.depthPods(1),
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <Stack height="100%" sx={{ overflow: 'hidden', visibility: 'visible' }}>
        <Row justifyContent="space-between" width="100%" p={0.8}>
          <Typography variant="bodySmall" fontWeight={FontWeight.bold}>
            ORDERBOOK
          </Typography>
          <SelectionGroup
            options={precisionOptions}
            value={precision}
            setValue={setPrecision}
            fontSize="sm"
          />
        </Row>
        <Divider />
        <Box
          sx={{
            px: 0.2,
            height: tableHeight,
            width: '100%',
            ...marketplaceTableStyle,
          }}
        >
          <DataGrid
            columns={cols}
            rows={orders}
            pageSize={ROWS_PER_PAGE}
            density="compact"
            onRowClick={() => {}}
            initialState={{
              sorting: {
                sortModel: [{ field: 'price', sort: 'asc' }],
              },
            }}
            components={{
              Pagination: ArrowPagination,
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default OrderBook;

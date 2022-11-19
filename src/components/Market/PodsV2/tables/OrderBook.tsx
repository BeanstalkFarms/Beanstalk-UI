import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import {
  GridRenderCellParams,
  GridColumns,
  DataGrid,
  DataGridProps,
} from '@mui/x-data-grid';
import React, { useMemo, useState } from 'react';
import { BeanstalkPalette, FontSize, FontWeight } from '~/components/App/muiTheme';
import ArrowPagination from '~/components/Common/ArrowPagination';
import Row from '~/components/Common/Row';
import PercentDropdown from '~/components/Market/PodsV2/PercentDropdown';

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

const percentOptions = [
  '0.01',
  '0.02',
  '0.03',
  '0.04',
  '0.05',
  '0.06'
];

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
  Array(100)
    .fill(null)
    .map((_, i) => ({
      id: i % 0.1,
      price: i,
      depthBean: i,
      maxPlaceInLineBuy: i,
      maxPlaceInLineSell: i,
      depthPods: i,
    }));

const OrderBook: React.FC<{}> = () => {
  const orders = useFakeOrders();
  const [numberFormat, setNumberFormat] = useState(0);
  const [percent, setPercent] = useState(percentOptions[0]);

  const ROWS_PER_PAGE = 14;

  const tableHeight = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    return 95 + Math.min(orders.length, ROWS_PER_PAGE) * 36;
  }, [orders]);

  const cols: DataGridProps['columns'] = [
    OrderbookCols.price(1),
    OrderbookCols.depthBean(1),
    OrderbookCols.maxPlaceInLineBuy(1),
    OrderbookCols.minPlaceInLineSell(1),
    OrderbookCols.depthPods(1),
  ];

  return (
    <Card>
      <Stack>
        <Row justifyContent="space-between" width="100%" p={0.8}>
          <Typography variant="bodySmall" fontWeight={FontWeight.bold}>
            ORDERBOOK
          </Typography>
          <Row gap={0.8}>
            <Card sx={{ borderRadius: 0.4, height: '100%', p: 0.2 }}>
              <Row gap={0.4}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setNumberFormat(0)}
                  sx={{
                    py: 0.2,
                    px: 0.3,
                    borderRadius: 0.4,
                    minWidth: 'unset',
                    backgroundColor: numberFormat === 0 ? BeanstalkPalette.lightYellow : null,
                    '&:hover': {
                      backgroundColor: numberFormat === 0 ? BeanstalkPalette.lightYellow : null,
                    }
                  }}
                >
                  <Typography variant="caption" color="text.primary">MIN/MAX</Typography>
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setNumberFormat(1)}
                  sx={{
                    py: 0.2,
                    px: 0.3,
                    borderRadius: 0.4,
                    minWidth: 'unset',
                    backgroundColor: numberFormat === 1 ? BeanstalkPalette.lightYellow : null,
                    '&:hover': {
                      backgroundColor: numberFormat === 1 ? BeanstalkPalette.lightYellow : null,
                    }
                  }}
                >
                  <Typography variant="caption" color="text.primary">AVG</Typography>
                </Button>
              </Row>
            </Card>
            <PercentDropdown options={percentOptions} selectedOption={percent} setOption={setPercent}  />
          </Row>
        </Row>
        <Divider />
        <Stack sx={{ overflowY: 'scroll' }}>
          <Box
            sx={{
              px: 0.2,
              height: tableHeight,
              width: '100%',
              ...orderbookTableStyle,
            }}
          >
            <DataGrid
              columns={cols}
              rows={orders}
              pageSize={ROWS_PER_PAGE}
              density="compact"
              onRowClick={() => {
              }}
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
      </Stack>
    </Card>
  );
};

export default OrderBook;

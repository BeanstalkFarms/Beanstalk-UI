import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardProps, Stack, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useTheme } from '@mui/material/styles';
import { marketplaceTableStyle } from '../../util/marketplaceTableStyle';
import BuySellTable from './BuySellTable';
import { displayBN, displayFullBN } from '../../util';

const buyColumns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'expiry',
    headerName: 'Expiry',
    flex: 0.5,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'price',
    headerName: 'Price',
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'amount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
];

const buyRows = [
  {
    id: 0,
    placeInLine: new BigNumber(634533),
    expiry: new BigNumber(123),
    price: new BigNumber(345345345),
    amount: new BigNumber(1)
  },
  {
    id: 1,
    placeInLine: new BigNumber(634533),
    expiry: new BigNumber(2342),
    price: new BigNumber(345),
    amount: new BigNumber(234234233)
  },
  {
    id: 2,
    placeInLine: new BigNumber(34454),
    expiry: new BigNumber(234234),
    price: new BigNumber(1),
    amount: new BigNumber(2333)
  },
  {
    id: 3,
    placeInLine: new BigNumber(145),
    expiry: new BigNumber(2344532),
    price: new BigNumber(0.5),
    amount: new BigNumber(2342333)
  },
  {
    id: 4,
    placeInLine: new BigNumber(145),
    expiry: new BigNumber(2344532),
    price: new BigNumber(0.5),
    amount: new BigNumber(2342333)
  },
  {
    id: 5,
    placeInLine: new BigNumber(145),
    expiry: new BigNumber(2344532),
    price: new BigNumber(0.5),
    amount: new BigNumber(2342333)
  }
];

const sellColumns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 0.5,
    renderCell: (params) => <Typography>{params.value}</Typography>,
  },
  {
    field: 'price',
    headerName: 'Price',
    align: 'right',
    headerAlign: 'right',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'podsRequested',
    headerName: 'Pods Requested',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
];

const sellRows = [
  {
    id: 0,
    placeInLine: '0 - 14,000',
    price: new BigNumber(345345345),
    podsRequested: new BigNumber(1)
  },
  {
    id: 1,
    placeInLine: '0 - 14,000',
    price: new BigNumber(345),
    podsRequested: new BigNumber(234234233)
  },
  {
    id: 2,
    placeInLine: '0 - 14,000',
    price: new BigNumber(1),
    podsRequested: new BigNumber(2333)
  },
  {
    id: 3,
    placeInLine: '0 - 14,000',
    price: new BigNumber(0.5),
    podsRequested: new BigNumber(2342333)
  }
];

const BuySellCard: React.FC<CardProps> = ({ sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    };

  return (
    <Card sx={{ p: 2, width: isMobile ? '100%' : '70%', ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
          <Tab label="Buy Now" />
          <Tab label="Sell Now" />
        </Tabs>
        {tab === 0 && (
          <Button>
            Create Buy Order
          </Button>
        )}
        {tab === 1 && (
          <Button>
            Create Sell Listing
          </Button>
        )}
      </Stack>
      {tab === 0 && <BuySellTable columns={buyColumns} rows={buyRows} />}
      {tab === 1 && <BuySellTable columns={sellColumns} rows={sellRows} />}
    </Card>
  );
};

export default BuySellCard;

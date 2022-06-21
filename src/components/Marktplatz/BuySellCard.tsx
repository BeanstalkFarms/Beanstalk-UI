import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, Card, CardProps, Stack, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { DataGrid, DataGridProps, GridRowParams } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useTheme } from '@mui/material/styles';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import podIcon from 'img/beanstalk/pod-icon.svg';
import { marketplaceTableStyle } from '../../util/marketplaceTableStyle';
import BuySellTable from './Tables/BuySellTable';
import { displayBN, displayFullBN } from '../../util';
import PickBeansDialog from '../Common/Dialogs/PickBeansDialog';
import BuyOrderModal from './Modals/BuyOrderModal';
import SellListingModal from './Modals/SellListingModal';
import BuyNowModal from './Modals/BuyNowModal';
import SellNowModal from './Modals/SellNowModal';

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
    renderCell: (params) => (
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Stack>
    ),
  },
  {
    field: 'amount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={podIcon} alt="Pods Icon" height="18px" />
      </Stack>
    ),
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
    renderCell: (params) => (
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={beanIcon} alt="Bean Icon" height="18px" />
      </Stack>
    ),
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
    renderCell: (params) => (
      <Stack direction="row" gap={0.3} alignItems="center">
        <Typography>{displayBN(params.value)}</Typography>
        <img src={podIcon} alt="Pods Icon" height="18px" />
      </Stack>
    ),
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

  // Create Buy Order
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const handleBuyModalOpen = useCallback(() => {
    setBuyModalOpen(true);
  }, []);
  const handleBuyModalClose = useCallback(() => {
    setBuyModalOpen(false);
  }, []);

  // Buy Now
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [buyNowRow, setBuyNowRow] = useState<any>();
  const handleBuyNowModalOpen = useCallback((params: GridRowParams) => {
    setBuyNowRow(params.row);
    setBuyNowModalOpen(true);
  }, []);
  const handleBuyNowModalClose = useCallback(() => {
    setBuyNowModalOpen(false);
  }, []);

  // Create Sell Listing
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const handleSellModalOpen = useCallback(() => {
    setSellModalOpen(true);
  }, []);
  const handleSellModalClose = useCallback(() => {
    setSellModalOpen(false);
  }, []);

  // Sell Now
  const [sellNowModalOpen, setSellNowModalOpen] = useState(false);
  const [sellNowRow, setSellNowRow] = useState<any>();
  const handleSellNowModalOpen = useCallback((params: GridRowParams) => {
    setSellNowRow(params.row);
    setSellNowModalOpen(true);
  }, []);
  const handleSellNowModalClose = useCallback(() => {
    setSellNowModalOpen(false);
  }, []);

  return (
    <>
      <Card sx={{ p: 2, width: isMobile ? '100%' : '70%', ...sx }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
            <Tab label="Buy Now" />
            <Tab label="Sell Now" />
          </Tabs>
          {tab === 0 && (
            <Button onClick={handleBuyModalOpen}>
              Create Buy Order
            </Button>
          )}
          {tab === 1 && (
            <Button onClick={handleSellModalOpen}>
              Create Sell Listing
            </Button>
          )}
        </Stack>
        {tab === 0 && <BuySellTable columns={buyColumns} rows={buyRows} onRowClick={handleBuyNowModalOpen} />}
        {tab === 1 && <BuySellTable columns={sellColumns} rows={sellRows} onRowClick={handleSellNowModalOpen} />}
      </Card>
      {/* modals */}
      <BuyOrderModal fullWidth open={buyModalOpen} handleClose={handleBuyModalClose} />
      <SellListingModal fullWidth open={sellModalOpen} handleClose={handleSellModalClose} />
      <BuyNowModal fullWidth handleClose={handleBuyNowModalClose} open={buyNowModalOpen} row={buyNowRow} />
      <SellNowModal fullWidth handleClose={handleSellNowModalClose} open={sellNowModalOpen} row={sellNowRow} />
    </>
  );
};

export default BuySellCard;

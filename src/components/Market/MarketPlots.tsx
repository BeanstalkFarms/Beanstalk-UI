import React, { useCallback, useState } from 'react';
import { Box, Card, CardProps, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PlotTable from './Tables/PlotTable';
import SellNowDialog from './Dialogs/SellNowDialog';
import { mockPodListingData, mockPodOrderData, PodOrder } from './Plots.mock';
import { displayBN, displayFullBN } from '../../util';
import beanIcon from '../../img/tokens/bean-logo-circled.svg';
import podIcon from '../../img/beanstalk/pod-icon.svg';
import { AppState } from '../../state';
import { BeanstalkPalette } from '../App/muiTheme';

const MarketPlots: React.FC<CardProps> = ({ sx }) => {
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  
  const LISTING_COLUMNS : DataGridProps['columns'] = [
    {
      field: 'account',
      headerName: 'Listing',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" gap={1} alignItems="center">
          <Typography>Pod Listing</Typography>
          <Box
            sx={{
              borderRadius: 1,
              px: 0.8,
              py: 0.5,
              backgroundColor: BeanstalkPalette.lightGreen,
              color: BeanstalkPalette.logoGreen
          }}
          >
            <Typography>{params.value.substring(0, 6)}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'index',
      headerName: 'Place In Line',
      flex: 1.5,
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 0)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={1}>
          <Typography>{displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)} in Line</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>expires at {displayFullBN(new BigNumber(params.row.maxHarvestableIndex).minus(beanstalkField.harvestableIndex), 0)}</Typography>
        </Stack>
      ),
    },
    {
      field: 'pricePerPod',
      headerName: 'Price',
      align: 'right',
      headerAlign: 'right',
      flex: 1,
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 0)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={beanIcon} alt="Bean Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>Per Pod</Typography>
        </Stack>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Number of Pods',
      flex: 1,
      disableColumnMenu: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => (
        `${displayFullBN(params.value as BigNumber, 2)}`
      ),
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={podIcon} alt="Pods Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
        </Stack>
      ),
    },
  ];

  const orderColumns: DataGridProps['columns'] = [
    {
      field: 'account',
      headerName: 'Order',
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" gap={1} alignItems="center">
          <Typography>Pod Order</Typography>
          <Box
            sx={{
              borderRadius: 1,
              px: 0.8,
              py: 0.5,
              backgroundColor: BeanstalkPalette.lightGreen,
              color: BeanstalkPalette.logoGreen
          }}
          >
            <Typography>{params.value.substring(0, 6)}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'maxPlaceInLine',
      headerName: 'Place In Line',
      flex: 1,
      renderCell: (params) => (
        <Typography>0 - {displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)} <Typography display="inline" color={BeanstalkPalette.lightishGrey}>in Line</Typography></Typography>
      ),
    },
    {
      field: 'pricePerPod',
      headerName: 'Price',
      align: 'right',
      headerAlign: 'right',
      flex: 1,
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 0)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={beanIcon} alt="Bean Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
          <Typography color={BeanstalkPalette.lightishGrey}>Per Pod</Typography>
        </Stack>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      flex: 1,
      disableColumnMenu: true,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 2)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={podIcon} alt="Pods Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
        </Stack>
      ),
    },
  ];

  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleBuyNowModalOpen = useCallback((params: GridRowParams) => {
    console.log('ROW', params.row.id);
    navigate(`/market/listing/${params.row.id}`);
    // setBuyNowRow(params.row);
    // setBuyNowDialogOpen(true);
  }, [navigate]);

  /**
   * User clicks a row under Sell Now tab
   */
  const [sellNowModalOpen, setSellNowModalOpen] = useState(false);
  const [sellNowRow, setSellNowRow] = useState<PodOrder | undefined>();

  const handleSellNowModalOpen = useCallback((params: GridRowParams) => {
    console.log('ROW', params.row.id);
    navigate(`/market/order/${params.row.id}`);
    // setSellNowRow(params.row);
    // setSellNowModalOpen(true);
  }, [navigate]);

  const handleSellNowModalClose = useCallback(() => {
    setSellNowModalOpen(false);
  }, []);

  return (
    <>
      <Card sx={{ p: 2, ...sx }}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Buy Now" />
          <Tab label="Sell Now" />
        </Tabs>

        {/* Buy Now tab */}
        {tab === 0 && (
          <PlotTable
            columns={LISTING_COLUMNS}
            rows={mockPodListingData}
            maxRows={8}
            onRowClick={handleBuyNowModalOpen}
          />
        )}

        {/* Sell Now tab */}
        {tab === 1 && (
          <PlotTable
            columns={orderColumns}
            rows={mockPodOrderData}
            maxRows={8}
            onRowClick={handleSellNowModalOpen}
          />
       )}
      </Card>

      {/* User clicks a row under Sell Now tab */}
      <SellNowDialog
        fullWidth
        handleClose={handleSellNowModalClose}
        open={sellNowModalOpen}
        podListing={sellNowRow}
        harvestableIndex={beanstalkField.harvestableIndex}
      />
    </>
  );
};

export default MarketPlots;

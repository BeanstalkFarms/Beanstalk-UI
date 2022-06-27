import React, { useCallback, useState } from 'react';
import { Card, CardProps, Stack, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useTheme } from '@mui/material/styles';
import PlotTable from './Tables/PlotTable';
import MyOrdersDialog from './Dialogs/MyOrdersDialog';
import MyListingsDialog from './Dialogs/MyListingsDialog';
import { mockPodListingData } from './Plots.mock';
import { displayBN, displayFullBN } from '../../util';

const myListingsColumns: DataGridProps['columns'] = [
  {
    field: 'totalAmount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) => `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
  {
    field: 'index',
    headerName: 'Place In Line',
    flex: 1,
    disableColumnMenu: true,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => <Typography>{displayBN(params.value)}</Typography>,
  },
];

const MyPlots: React.FC<CardProps> = ({ sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  /**
   * User clicks "Create Buy Order" button
   */
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);
  const [myOrderRow, setMyOrderRow] = useState<any>();

  const handleMyOrdersOpen = useCallback((params: GridRowParams) => {
    setMyOrderRow(params.row);
    setMyOrdersOpen(true);
  }, []);

  const handleMyOrdersClose = useCallback(() => {
    setMyOrdersOpen(false);
  }, []);

  /**
   * User clicks "Create Sell Listing" button
  */
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [myListingRow, setMyListingRow] = useState<any>();

  const handleSellModalOpen = useCallback((params: GridRowParams) => {
    setMyListingRow(params.row);
    setSellModalOpen(true);
  }, []);

  const handleSellModalClose = useCallback(() => {
    setSellModalOpen(false);
  }, []);
  
  return (
    <>
      <Card sx={{ p: 2, ...sx }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Tabs value={tab} onChange={handleChangeTab} sx={{ alignItems: 'center' }}>
            <Tab label="My Orders" />
            <Tab label="My Listings" />
          </Tabs>
        </Stack>
        {tab === 0 && (
          <PlotTable
            columns={myListingsColumns}
            rows={mockPodListingData}
            maxRows={3}
            onRowClick={handleMyOrdersOpen}
          />
        )}
        {tab === 1 && (
          <PlotTable
            columns={myListingsColumns}
            rows={mockPodListingData}
            maxRows={3}
            onRowClick={handleSellModalOpen}
          />
        )}
      </Card>

      {/* ----- modals ----- */}
      {/* User clicks "My Orders" tab */}
      <MyOrdersDialog
        fullWidth
        open={myOrdersOpen}
        handleClose={handleMyOrdersClose}
        podListing={myOrderRow}
      />

      {/* User clicks "My Listings" tab */}
      <MyListingsDialog
        fullWidth
        open={sellModalOpen}
        handleClose={handleSellModalClose}
        podListing={myListingRow}
      />
    </>
  );
};

export default MyPlots;

import React, { useCallback, useState } from 'react';
import { Card, CardProps, Stack, Tab, Tabs, Typography } from '@mui/material';
import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PlotTable from './Tables/PlotTable';
import { mockPodListingData, mockPodOrderData } from './Plots.mock';
import { displayBN, displayFullBN } from '../../util';
import { BeanstalkPalette } from '../App/muiTheme';
import { AppState } from '../../state';
import beanIcon from '../../img/tokens/bean-logo-circled.svg';
import podIcon from '../../img/beanstalk/pod-icon.svg';

const MyPlots: React.FC<CardProps> = ({ sx }) => {
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );

  const myOrdersColumns: DataGridProps['columns'] = [
    {
      field: 'maxPlaceInLine',
      headerName: 'Place In Line',
      flex: 1,
      renderCell: (params) => (
        <Typography>0 - {displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)}</Typography>
      ),
    },
    {
      field: 'pricePerPod',
      headerName: 'Price',
      align: 'left',
      headerAlign: 'left',
      flex: 1,
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 0)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={beanIcon} alt="Bean Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
        </Stack>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Number of Pods',
      flex: 1,
      disableColumnMenu: true,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => (
        `${displayFullBN(params.value as BigNumber, 2)}`
      ),
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={podIcon} alt="Pods Icon" height="18px" />
          <Typography>{displayBN(params.row.filledAmount)}
            {/* /{displayBN(params.row.totalAmount)} */}
            {/* <Typography */}
            {/*  display="inline" */}
            {/*  color={BeanstalkPalette.lightishGrey}>Purchased */}
            {/* </Typography> */}
          </Typography>
        </Stack>
      ),
    },
  ];

  const myListingsColumns: DataGridProps['columns'] = [
    {
      field: 'index',
      headerName: 'Place In Line',
      flex: 1.5,
      renderCell: (params) => (
        <Typography>{displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)}</Typography>
      ),
    },
    {
      field: 'pricePerPod',
      headerName: 'Price',
      align: 'left',
      headerAlign: 'left',
      flex: 1,
      valueFormatter: (params) =>
        `${displayFullBN(params.value as BigNumber, 0)}`,
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={beanIcon} alt="Bean Icon" height="18px" />
          <Typography>{displayBN(params.value)}</Typography>
        </Stack>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Number of Pods',
      flex: 1,
      disableColumnMenu: true,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (params) => (
        `${displayFullBN(params.value as BigNumber, 2)}`
      ),
      renderCell: (params) => (
        <Stack direction="row" gap={0.3} alignItems="center">
          <img src={podIcon} alt="Pods Icon" height="18px" />
          <Typography>{displayBN(params.row.filledAmount)}
            {/* /{displayBN(params.row.totalAmount)} */}
            {/* <Typography */}
            {/*  display="inline" */}
            {/*  color={BeanstalkPalette.lightishGrey}>Sold */}
            {/* </Typography> */}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'maxHarvestableIndex',
      headerName: 'Expiry',
      flex: 1.5,
      renderCell: (params) => (
        <Typography color={BeanstalkPalette.lightishGrey}>{displayFullBN(new BigNumber(params.row.maxHarvestableIndex).minus(beanstalkField.harvestableIndex), 0)} in Line</Typography>
      ),
    },
  ];

  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOrderClick = useCallback((params: GridRowParams) => {
    navigate(`/market/order/${params.row.id}/edit`);
  }, [navigate]);

  const handleListingClick = useCallback((params: GridRowParams) => {
    navigate(`/market/listing/${params.row.id}/edit`);
  }, [navigate]);

  return (
    <>
      <Card sx={{ p: 2, ...sx }}>
        <Stack gap={1}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
            variant="scrollable"
          >
            <Tab label="My Orders" />
            <Tab label="My Listings" />
          </Tabs>
          {tab === 0 && (
            <PlotTable
              columns={myOrdersColumns}
              rows={mockPodOrderData}
              maxRows={3}
              onRowClick={handleOrderClick}
            />
          )}
          {tab === 1 && (
            <PlotTable
              columns={myListingsColumns}
              rows={mockPodListingData}
              maxRows={3}
              onRowClick={handleListingClick}
            />
          )}
        </Stack>
      </Card>
    </>
  );
};

export default MyPlots;

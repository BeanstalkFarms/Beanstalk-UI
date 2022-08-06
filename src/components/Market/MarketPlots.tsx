// import React, { useCallback } from 'react';
// import { Card, CardProps, Stack, Tab, Tabs, Typography } from '@mui/material';
// import { DataGridProps, GridRowParams } from '@mui/x-data-grid';
// import BigNumber from 'bignumber.js';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// // import buyNowIcon from '~/img/interface/buy-pods.svg';
// // import sellNowIcon from '~/img/interface/sell-pods.svg';
// import MarketBaseTable from './Tables/MarketBaseTable';
// import { mockPodListingData, mockPodOrderData } from './Plots.mock';
// import { displayBN, displayFullBN } from '../../util';
// import beanIcon from '../../img/tokens/bean-logo-circled.svg';
// import podIcon from '../../img/beanstalk/pod-icon.svg';
// import { AppState } from '../../state';
// import { BeanstalkPalette } from '../App/muiTheme';

// const MarketPlots: React.FC<CardProps> = ({ sx }) => {
//   const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
//     (state) => state._beanstalk.field
//   );

//   ///
//   ///
//   const LISTING_COLUMNS: DataGridProps['columns'] = [
//     {
//       field: 'index',
//       headerName: 'Place In Line',
//       flex: 1,
//       valueFormatter: (params) =>
//         `${displayFullBN(params.value as BigNumber, 0)}`,
//       renderCell: (params) => (
//         <Typography>{displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)}</Typography>
//       ),
//     },
//     {
//       field: 'pricePerPod',
//       headerName: 'Price Per Pod',
//       align: 'left',
//       headerAlign: 'left',
//       flex: 1,
//       valueFormatter: (params) =>
//         `${displayFullBN(params.value as BigNumber, 0)}`,
//       renderCell: (params) => (
//         <Stack direction="row" gap={0.3} alignItems="center">
//           <img src={beanIcon} alt="Bean Icon" height="18px" />
//           <Typography>{displayBN(params.value)}</Typography>
//         </Stack>
//       ),
//     },
//     {
//       field: 'maxHarvestableIndex',
//       headerName: 'Expiration',
//       flex: 1,
//       valueFormatter: (params) =>
//         `${displayFullBN(params.value as BigNumber, 0)}`,
//       renderCell: (params) => (
//         <Typography color={BeanstalkPalette.lightishGrey}>{displayFullBN(new BigNumber(params.row.maxHarvestableIndex).minus(beanstalkField.harvestableIndex), 0)} in Line</Typography>
//       ),
//     },
//     {
//       field: 'totalAmount',
//       headerName: 'Number of Pods',
//       flex: 1,
//       disableColumnMenu: true,
//       align: 'left',
//       headerAlign: 'left',
//       valueFormatter: (params) => (
//         `${displayFullBN(params.value as BigNumber, 2)}`
//       ),
//       renderCell: (params) => (
//         <Stack direction="row" gap={0.3} alignItems="center">
//           <img src={podIcon} alt="Pods Icon" height="18px" />
//           <Typography>{displayBN(params.value)}</Typography>
//         </Stack>
//       ),
//     },
//     {
//       field: 'account',
//       headerName: 'From',
//       flex: 0,
//       renderCell: (params) => (
//         <Typography color="primary">{params.value.substring(0, 6)}</Typography>
//       ),
//     },
//   ];

//   ///
//   const ORDER_COLUMNS: DataGridProps['columns'] = [
//     {
//       field: 'maxPlaceInLine',
//       headerName: 'Place In Line',
//       flex: 1,
//       renderCell: (params) => (
//         <Typography>0 - {displayFullBN(new BigNumber(params.value).minus(beanstalkField.harvestableIndex), 0)}</Typography>
//       ),
//     },
//     {
//       field: 'pricePerPod',
//       headerName: 'Price',
//       align: 'left',
//       headerAlign: 'left',
//       flex: 1,
//       valueFormatter: (params) =>
//         `${displayFullBN(params.value as BigNumber, 0)}`,
//       renderCell: (params) => (
//         <Stack direction="row" gap={0.3} alignItems="center">
//           <img src={beanIcon} alt="Bean Icon" height="18px" />
//           <Typography>{displayBN(params.value)}</Typography>
//         </Stack>
//       ),
//     },
//     {
//       field: 'totalAmount',
//       headerName: 'Number of Pods',
//       flex: 1,
//       disableColumnMenu: true,
//       align: 'left',
//       headerAlign: 'left',
//       valueFormatter: (params) =>
//         `${displayFullBN(params.value as BigNumber, 2)}`,
//       renderCell: (params) => (
//         <Stack direction="row" gap={0.3} alignItems="center">
//           <img src={podIcon} alt="Pods Icon" height="18px" />
//           <Typography>{displayBN(params.value)}</Typography>
//         </Stack>
//       ),
//     },
//     {
//       field: 'account',
//       headerName: 'From',
//       flex: 0,
//       renderCell: (params) => (
//         <Typography color="primary">{params.value.substring(0, 6)}</Typography>
//       ),
//     },
//   ];

//   ///
//   const navigate = useNavigate();

//   /// Handlers
//   const handleClickListing = useCallback((params: GridRowParams) => {
//     navigate(`/market/listing/${params.row.id}`);
//   }, [navigate]);
//   const handleClickOrder = useCallback((params: GridRowParams) => {
//     navigate(`/market/order/${params.row.id}`);
//   }, [navigate]);

//   return (
//     <>
//       <Card sx={{ p: 2, ...sx }}>
//         <Stack gap={1}>
//           <Tabs
//             value={tab}
//             onChange={handleChangeTab}
//             sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
//             variant="scrollable"
//           >
//             <Tab
//               label="Buy Now"
//               // iconPosition="start"
//               // icon={<img src={buyNowIcon} alt="" />}
//             />
//             <Tab
//               label="Sell Now"
//               // icon={<img src={sellNowIcon} alt="" />}
//               // iconPosition="start"
//             />
//           </Tabs>
//           {/* Buy Now tab */}
//           {tab === 0 && (
//             <MarketBaseTable
//               columns={LISTING_COLUMNS}
//               rows={mockPodListingData}
//               maxRows={8}
//               onRowClick={handleClickListing}
//             />
//           )}
//           {/* Sell Now tab */}
//           {tab === 1 && (
//             <MarketBaseTable
//               columns={ORDER_COLUMNS}
//               rows={mockPodOrderData}
//               maxRows={8}
//               onRowClick={handleClickOrder}
//             />
//           )}
//         </Stack>
//       </Card>
//     </>
//   );
// };

export default null;

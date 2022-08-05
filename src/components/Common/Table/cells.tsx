import React from 'react';
import { Box, Chip, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { GridColumns, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { displayBN, displayFullBN, MaxBN } from 'util/index';
import BigNumber from 'bignumber.js';
import { BeanstalkPalette } from 'components/App/muiTheme';
import { BEAN, PODS } from '~/constants/tokens';
import { ZERO_BN } from '~/constants/index';
import { PodListing, PodOrder } from '~/state/farmer/market';
import TokenIcon from '../TokenIcon';
import AddressIcon from '../AddressIcon';

const basicCell = (params : GridRenderCellParams) => <Typography>{params.formattedValue}</Typography>;

const COLUMNS = {
  ///
  /// Generics
  ///
  season: {
    field: 'season',
    flex: 0.8,
    headerName: 'Season',
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => params.value.toString(),
    renderCell: basicCell,
    sortable: false,
  } as GridColumns[number],

  ///
  /// Silo
  ///
  seeds: {
    field: 'seeds',
    flex: 1,
    headerName: 'Seeds',
    align: 'right',
    headerAlign: 'right',
    valueFormatter: (params: GridValueFormatterParams) => displayFullBN(params.value, 2),
    renderCell: (params : GridRenderCellParams) => (
      <>
        <Typography display={{ xs: 'none', md: 'block' }}>{displayFullBN(params.value, 2)}</Typography>
        <Typography display={{ xs: 'block', md: 'none' }}>{displayBN(params.value)}</Typography>
      </>
    ),
    sortable: false,
  } as GridColumns[number],

  ///
  /// Market
  ///
  numPods: {
    field: 'totalAmount',
    headerName: 'Amount',
    type: 'number',
    flex: 1,
    // disableColumnMenu: true,

    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip
        placement="right"
        title={
          <>
            Total Value: {displayFullBN((params.value as BigNumber).times(params.row.pricePerPod), BEAN[1].displayDecimals)} BEAN
          </>
      }>
        <Stack direction="row" gap={0.3} alignItems="center">
          <TokenIcon token={PODS} />
          <Typography>
            {displayBN(params.value)}
          </Typography>
        </Stack>
      </Tooltip>
    ),
  } as GridColumns[number],

  listingId: {
    field: 'id',
    headerName: 'Pod Listing',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, PodListing>) => (
      <Tooltip
        placement="right"
        title="">
        <Stack direction="row" gap={1} alignItems="center">
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              backgroundColor: BeanstalkPalette.mediumRed,
              width: '25px',
              height: '25px',
              p: 1,
              pl: 1.1,
              borderRadius: '50%'
            }}>
            <TokenIcon token={PODS} />
          </Stack>
          <Typography>
            #{params.row.id}
          </Typography>
        </Stack>
      </Tooltip>
    )
  } as GridColumns[number],

  orderId: {
    field: 'id',
    headerName: 'Pod Order',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, PodListing>) => (
      <Tooltip
        placement="right"
        title="">
        <Stack direction="row" gap={1} alignItems="center">
          {/* FIXME: standardize */}
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              backgroundColor: BeanstalkPalette.mediumGreen,
              width: '25px',
              height: '25px',
              p: 1,
              pl: 1.1,
              borderRadius: '50%'
            }}>
            <TokenIcon token={PODS} />
          </Stack>
          <Typography>
            {params.row.id.substring(0, 8)}
          </Typography>
        </Stack>
      </Tooltip>
    )
  } as GridColumns[number],

  ///
  numPodsActive: {
    field: 'remainingAmount',
    headerName: 'Amount',
    flex: 1,
    type: 'number',
    // disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, PodListing>) => (
      <Tooltip
        placement="right"
        title={
          <>
            Total Value: {displayFullBN((params.value as BigNumber).times(params.row.pricePerPod), BEAN[1].displayDecimals)} BEAN
          </>
      }>
        <Stack direction="row" gap={0.3} alignItems="center">
          <TokenIcon token={PODS} />
          <Typography>
            {displayBN(params.row.remainingAmount)}
          </Typography>
        </Stack>
      </Tooltip>

    )
  } as GridColumns[number],
  progress: {
    field: 'progress',
    headerName: 'Progress',
    align: 'left',
    headerAlign: 'left',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, PodListing | PodOrder>) => {
      const progress = params.row.filledAmount.div(params.row.totalAmount).times(100);
      return (
        <Stack gap={1} direction="row" width="100%" alignItems="center">
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              color="primary"
              value={progress.toNumber()}
            />
          </Box>
          <Typography fontSize="bodySmall" color="gray">
            {progress.toFixed(1)}%
          </Typography>
        </Stack>
      );
    },
  } as GridColumns[number],
  pricePerPod: {
    field: 'pricePerPod',
    headerName: 'Price per Pod',
    type: 'number',
    align: 'left',
    headerAlign: 'left',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, PodListing | PodOrder>) => (
      <Stack direction="row" gap={0.3} alignItems="center">
        <TokenIcon token={BEAN[1]} />
        <Typography>
          {displayFullBN(params.value)}
        </Typography>
      </Stack>
    ),
  } as GridColumns[number],

  fromAccount: {
    field: 'account',
    headerName: 'From',
    flex: 0,
    renderCell: (params: GridRenderCellParams) => (
      <Typography color="primary">
        {params.value.substring(0, 6)}
      </Typography>
    ),
  } as GridColumns[number],

  // https://mui.com/x/react-data-grid/column-definition/#converting-types
  plotIndex: (harvestableIndex: BigNumber) => ({
    field: 'index',
    headerName: 'Place in Line',
    flex: 1,
    type: 'number',
    align: 'left',
    headerAlign: 'left',
    valueGetter: (params: GridRenderCellParams) => (
      params.value - harvestableIndex.toNumber()
    ),
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        {displayFullBN(new BigNumber(params.value), 0)}
      </Typography>
    ),
  } as GridColumns[number]),
  maxPlaceInLine: {
    field: 'maxPlaceInLine',
    headerName: 'Place in Line',
    type: 'number',
    flex: 1,
    align: 'left',
    headerAlign: 'left',
    valueGetter: (params: GridRenderCellParams) => (
      (params.value as BigNumber).toNumber()
    ),
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        0 - {displayFullBN(new BigNumber(params.value), 0)}
      </Typography>
    ),
  } as GridColumns[number],
  expiry: (
    harvestableIndex: BigNumber
  ) => ({
    field: 'maxHarvestableIndex',
    headerName: 'Expires in',
    flex: 1,
    value: 'number',
    filterable: false, // TODO: make this filterable
    renderCell: (params: GridRenderCellParams) => {
      const expiresIn = MaxBN((params.value as BigNumber).minus(harvestableIndex), ZERO_BN);
      const tip = expiresIn?.gt(0) ? (
        <>If the Pod Line moves forward {displayFullBN((params.value as BigNumber).minus(harvestableIndex), PODS.displayDecimals)} Pods, this Listing will expire.</>
      ) : '';
      return (
        <Tooltip placement="right" title={tip}>
          <Typography>
            {displayBN(expiresIn)} Pods
          </Typography>
        </Tooltip>
      );
    }
  } as GridColumns[number]),
  status: (
    harvestableIndex: BigNumber
  ) => ({
    field: 'status',
    headerName: 'Status',
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip title="">
        <Typography>
          {params.row.status === 'filled' 
            ? <Chip color="primary" label="Filled" variant="filled" />
            /// FIXME: right now the event processor doesn't flag
            /// listings as expired, so we override status here.
            : harvestableIndex.gte((params.row.maxHarvestableIndex as BigNumber))
              ? <Chip color="warning" label="Expired" variant="filled" />
              : <Chip color="secondary" label="Active" variant="filled" />
          }
        </Typography>
      </Tooltip>
    )
  } as GridColumns[number]),

  ///
  /// Extras
  ///
  connectedAccount: {
    field: 'connectedAccount',
    headerName: '',
    width: 10,
    sortable: false,
    filterable: false,
    renderCell: () => <AddressIcon />,
  } as GridColumns[number],
  rightChevron: {
    field: 'rightChevron',
    headerName: '',
    width: 20,
    sortable: false,
    filterable: false,
    renderCell: () => <ArrowRightIcon color="secondary" />
  } as GridColumns[number],
};

export default COLUMNS;

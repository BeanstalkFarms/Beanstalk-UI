import React from 'react';
import { Box, Chip, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import { GridColumns, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { displayBN, displayFullBN, MaxBN } from 'util/index';
import BigNumber from 'bignumber.js';
import { BEAN, PODS } from 'constants/tokens';
import { ZERO_BN } from 'constants/index';
import { PodListing, PodOrder } from 'state/farmer/market';
import TokenIcon from '../TokenIcon';
import AddressIcon from '../AddressIcon';

const basicCell = (params : GridRenderCellParams) => <Typography>{params.formattedValue}</Typography>;

/*  = */

const COLUMNS = {
  ///
  /// Generics
  /// 
  season: {
    field: 'season',
    flex: 1,
    headerName: 'Season',
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params: GridValueFormatterParams) => displayBN(params.value),
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
    valueFormatter: (params: GridValueFormatterParams) => displayBN(params.value),
    renderCell: basicCell,
    sortable: false,
  } as GridColumns[number],

  /// 
  /// Market
  /// 
  numPods: {
    field: 'totalAmount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip placement="right" title={<>{displayFullBN(params.value)} Pods</>}>
        <Stack direction="row" gap={0.3} alignItems="center">
          <TokenIcon token={PODS} />
          <Typography>
            {displayBN(params.value)}
          </Typography>
        </Stack>
      </Tooltip>
    ),
  } as GridColumns[number],

  ///
  numPodsActive: {
    field: 'remainingAmount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, PodListing>) => (
      <Tooltip
        placement="right"
        title={(
          <>
            Total: {displayFullBN(params.row.totalAmount)} Pods<br />
            Remaining: {displayFullBN(params.row.remainingAmount)} Pods<br />
            {/* {params.row.filledAmount.div(params.row.totalAmount).times(100).toFixed(2)}% Filled */}
          </>
        )}>
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
    align: 'left',
    headerAlign: 'left',
    flex: 1,
    renderCell: (params: GridRenderCellParams<any, PodListing | PodOrder>) => (
      <Tooltip
        placement="right"
        title={(
          <>
            Total Cost: {displayFullBN((params.value as BigNumber).times(params.row.remainingAmount), BEAN[1].displayDecimals)} BEAN
          </>
        )}>
        <Stack direction="row" gap={0.3} alignItems="center">
          <TokenIcon token={BEAN[1]} />
          <Typography>
            {displayFullBN(params.value)}
          </Typography>
        </Stack>
      </Tooltip>
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

  //
  plotIndex: (harvestableIndex: BigNumber) => ({
    field: 'index',
    headerName: 'Place In Line',
    flex: 1,
    valueParser: (params: GridValueFormatterParams) => (
      /// FIXME: may have roundoff errors
      (params.value as BigNumber).toNumber()
    ),
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        {displayFullBN((params.value as BigNumber).minus(harvestableIndex), 0)}
      </Typography>
    ),
  } as GridColumns[number]),

  maxPlaceInLine: {
    field: 'maxPlaceInLine',
    headerName: 'Place In Line',
    flex: 1,
    valueParser: (params: GridValueFormatterParams) => (
      /// FIXME: may have roundoff errors
      (params.value as BigNumber).toNumber()
    ),
    renderCell: (params: GridRenderCellParams) => (
      <Typography>
        0 - {displayFullBN((params.value as BigNumber), 0)}
      </Typography>
    ),
  } as GridColumns[number],
  expiry: (
    harvestableIndex: BigNumber
  ) => ({
    field: 'maxHarvestableIndex',
    headerName: 'Expires in',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      const expiresIn = MaxBN((params.value as BigNumber).minus(harvestableIndex), ZERO_BN);
      const tip = expiresIn?.gt(0) ? (
        <>If the Pod Line moves forward {displayFullBN((params.value as BigNumber).minus(harvestableIndex), PODS.displayDecimals)} more Pods, this Listing will expire.</>
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

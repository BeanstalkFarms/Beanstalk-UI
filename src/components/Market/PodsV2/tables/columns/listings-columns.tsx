import React from 'react';
import {
  GridColumns,
  GridRenderCellParams,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { Box, Tooltip, Typography } from '@mui/material';
import { PodListing } from '~/state/farmer/market';
import { displayBN, displayFullBN, MaxBN } from '~/util';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';
import { ZERO_BN } from '~/constants';

const MARKET_LISTING_COLUMNS = {
  listingId: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'id',
      headerName: 'Listing',
      flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderEditCellParams<any, PodListing>) => (
        <>{`#${params.value}`}</>
      ),
    } as GridColumns[number]),

  plotIndex: (
    harvestableIndex: BigNumber,
    flex: number,
    align?: 'left' | 'right'
  ) =>
    ({
      field: 'index',
      headerName: 'Place in Line',
      type: 'number',
      flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueGetter: (params: GridRenderCellParams) =>
        params.value - harvestableIndex.toNumber(),
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ fontSize: 'inherit' }} component="span">
          <Box display={{ xs: 'none', md: 'block' }}>
            {displayFullBN(new BigNumber(params.value), 0)}
          </Box>
          <Box display={{ xs: 'block', md: 'none' }}>
            {displayBN(new BigNumber(params.value))}
          </Box>
        </Typography>
      ),
    } as GridColumns[number]),

  pricePerPod: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'pricePerPod',
      headerName: 'Price per Pod',
      type: 'number',
      flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Row gap={0.25}>
          <TokenIcon token={BEAN[1]} />
          <Typography sx={{ fontSize: 'inherit' }}>
            {displayFullBN(params.value)}
          </Typography>
        </Row>
      ),
    } as GridColumns[number]),

  numPodsActive: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'remainingAmount',
      headerName: 'Amount',
      flex: flex,
      type: 'number',
      // disableColumnMenu: true,
      align: align || 'right',
      headerAlign: align || 'right',
      renderCell: (params: GridRenderCellParams<any, PodListing>) => (
        <Row gap={0.25}>
          <TokenIcon token={PODS} />
          <Typography sx={{ fontSize: 'inherit' }}>
            {displayBN(params.row.remainingAmount)}
          </Typography>
        </Row>
      ),
    } as GridColumns[number]),

  expiry: (
    harvestableIndex: BigNumber,
    flex: number,
    align?: 'left' | 'right'
  ) =>
    ({
      field: 'maxHarvestableIndex',
      headerName: 'Expires in',
      flex: flex,
      value: 'number',
      align: align || 'right',
      headerAlign: align || 'right',
      filterable: false, // TODO: make this filterable,
      renderCell: (params: GridRenderCellParams) => {
        const expiresIn = MaxBN(
          (params.value as BigNumber).minus(harvestableIndex),
          ZERO_BN
        );
        const tip = expiresIn?.gt(0) ? (
          <>
            If the Pod Line moves forward{' '}
            {displayFullBN(
              (params.value as BigNumber).minus(harvestableIndex),
              PODS.displayDecimals
            )}{' '}
            Pods, this Listing will expire.
          </>
        ) : (
          ''
        );
        return (
          <Tooltip placement="right" title={tip}>
            <Typography sx={{ fontSize: 'inherit' }}>
              {displayBN(expiresIn)} Pods
            </Typography>
          </Tooltip>
        );
      },
    } as GridColumns[number]),
};

export default MARKET_LISTING_COLUMNS;

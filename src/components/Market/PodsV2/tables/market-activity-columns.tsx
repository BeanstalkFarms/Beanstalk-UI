import React from 'react';
import {
  GridColumns,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayBN } from '~/util';
import { ZERO_BN } from '~/constants';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN } from '~/constants/tokens';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { IFarmerMarketEvent } from '~/hooks/farmer/useFarmerMarketplaceEvents';

const statusColorMap = {
  active: BeanstalkPalette.logoGreen,
  cancelled: 'text.secondary',
};

const formatDate = (value: string | undefined) => {
  if (!value) return '-';
  const date = DateTime.fromMillis((Number(value) * 1000) as number);
  return date.toLocaleString({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const POD_MARKET_COLUMNS = {
  date: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'time',
      headerName: 'DATE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        formatDate(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography color="text.tertiary" sx={{ fontSize: 'inherit' }}>
          {params.formattedValue}
        </Typography>
      ),
    } as GridColumns[number]),

  action: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'action',
      headerName: 'ACTION',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  type: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'type',
      headerName: 'TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  entity: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'entity',
      headerName: 'TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toString().toUpperCase()}</>
      ),
    } as GridColumns[number]),

  priceType: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'priceType',
      headerName: 'PRICE TYPE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{params.value.toUpperCase()}</>
      ),
    } as GridColumns[number]),

  pricePerPod: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'pricePerPod',
      headerName: 'PRICE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="inline-flex" sx={{ gap: 0.25, alignItems: 'center' }}>
          <TokenIcon token={BEAN[1]} />
          {displayBN(params.value || ZERO_BN)}
        </Box>
      ),
    } as GridColumns[number]),

  numPods: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'numPods',
      headerName: 'AMOUNT',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <>{displayBN(params.value)} PODS</>
      ),
    } as GridColumns[number]),

  numPodsActive: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'remainingAmount',
      headerName: 'AMOUNT',
      flex: flex,
      type: 'number',
      align: align || 'left',
      headerAlign: align,
      renderCell: (params: GridRenderCellParams) => (
        <>{displayBN(params.value)} PODS</>
      ),
    } as GridColumns[number]),

  placeInLine: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'placeInPodline',
      headerName: 'PLACE IN LINE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams<any, IFarmerMarketEvent>) => {
        const strVal =
          params.value instanceof BigNumber
            ? displayBN(params.value)
            : params.value;
        const isFixed = params.row.priceType === 'fixed';
        const start = isFixed ? 0 : '*'; // FIX ME: this doesn't show correct value for dynamic pricing
        return <>{`${start} - ${strVal}`}</>;
      },
    } as GridColumns[number]),

  activityPlaceInLine: (flex: number, align?: 'left' | 'right') => ({
    field: 'placeInPodline',
    headerName: 'PLACE IN LINE',
    flex: flex,
    headerAlign: align || 'left',
    renderCell: (params: GridRenderCellParams) => (
      <>{params.value}</>
    ),
  } as GridColumns[number]),

  expiry: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'expiry',
      headerName: 'EXPIRY @',
      flex: flex,
      align: align || 'left',
      type: 'string',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => {
        const expiry = params.value as BigNumber;
        return <>{expiry.gt(0) ? `${displayBN(expiry)} PODS` : '-'}</>;
      },
    } as GridColumns[number]),

  fillPct: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'fillPct',
      headerName: 'FILL %',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => {
        const progress = params.value as BigNumber;
        return (
          <Typography
            sx={{
              fontSize: 'inherit',
              color: params.value.gt(0)
                ? 'text.primary'
                : BeanstalkPalette.grey,
            }}
          >
            {progress.toFixed(1)}%
          </Typography>
        );
      },
    } as GridColumns[number]),

  total: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'totalBeans',
      headerName: 'TOTAL',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="inline-flex" sx={{ gap: 0.25, alignItems: 'center' }}>
          <TokenIcon token={BEAN[1]} />
          {displayBN(params.value || ZERO_BN)}
        </Box>
      ),
    } as GridColumns[number]),

  status: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'status',
      headerName: 'STATUS',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => {
        const key = params.value.toLowerCase();
        const color =
          key in statusColorMap
            ? statusColorMap[key as keyof typeof statusColorMap]
            : 'text.primary';

        return (
          <Typography sx={{ fontSize: 'inherit', color: color }}>
            {params.value.toString().toUpperCase()}
          </Typography>
        );
      },
    } as GridColumns[number]),
};

import React from 'react';
import {
  GridColumns,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { Box, Link, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { displayBN, displayFullBN, MinBN } from '~/util';
import { ZERO_BN } from '~/constants';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import { FarmerMarketHistoryItem } from '~/hooks/farmer/market/useFarmerMarket2';
import { PricingType } from '~/state/farmer/market';
import etherscanIcon from '~/img/beanstalk/interface/nav/etherscan.svg';
import Row from '~/components/Common/Row';

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

export const MARKET_ACTIVITY_COLUMNS = {
  // FIXME: move to market-columns
  createdAt: (
    flex: number,
    align?: 'left' | 'right',
    headerName = 'DATE',
    hashKey = 'hash'
  ) =>
    ({
      field: 'createdAt',
      headerName: headerName,
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      valueFormatter: (params: GridValueFormatterParams) =>
        formatDate(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography color="text.tertiary" sx={{ fontSize: 'inherit' }}>
          {params.row[hashKey] ? (
            <Link href={`https://etherscan.io/tx/${params.row[hashKey]}`} rel="noreferrer" target="_blank" underline="hover" color="text.tertiary" sx={{ '&:hover img': { display: 'inline-block' } }}>
              <Row>
                <span>{params.formattedValue}</span>
                <img src={etherscanIcon} alt="" css={{ height: 12, marginLeft: 5, display: 'none' }} />
              </Row>
            </Link>
          ) : params.formattedValue}
        </Typography>
      ),
    } as GridColumns[number]),

  labelAction: (flex: number, align?: 'left' | 'right') =>
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

  labelType: (flex: number, align?: 'left' | 'right') =>
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

  // FIXME: why is 'entity' used
  labelEntity: (flex: number, align?: 'left' | 'right') =>
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

  // pricingType: (flex: number, align?: 'left' | 'right') =>
  //   ({
  //     field: 'pricingType',
  //     headerName: 'PRICE TYPE',
  //     flex: flex,
  //     align: align || 'left',
  //     headerAlign: align || 'left',
  //     renderCell: (params: GridRenderCellParams) => (
  //       <>{params.value.toUpperCase()}</>
  //     ),
  //   } as GridColumns[number]),

  pricePerPod: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'pricePerPod',
      headerName: 'PRICE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="inline-flex" sx={{ gap: 0.25, alignItems: 'center' }}>
          {params.value?.gt(0) ? (
            <>
              <TokenIcon token={BEAN[1]} />
              {displayBN(params.value || ZERO_BN)}
            </>
          ) : (
            '-'
          )}
        </Box>
      ),
    } as GridColumns[number]),

  amountPods: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'amountPods',
      headerName: 'AMOUNT',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <>
            <TokenIcon token={PODS} />
            {displayBN(params.value)}
          </>
        ) : (
          '-'
        )
      ),
    } as GridColumns[number]),

  placeInLine: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'placeInLine',
      headerName: 'PLACE IN LINE',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams<any, FarmerMarketHistoryItem>) => {
        if (!params.value || params.value.eq(0))  {
          return <>-</>;
        }
        
        const strVal =
          params.value instanceof BigNumber
            ? displayBN(params.value)
            : params.value;
        const isListing = params.row.action === 'sell';

        if (isListing) {
          return <>{strVal}</>;
        }

        return (
          <>{`${params.row.pricingType === PricingType.DYNAMIC ? '*' : '0'} - ${strVal}`}</>
        );
      },
    } as GridColumns[number]),

  activityPlaceInLine: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'placeInLine',
      headerName: 'PLACE IN LINE',
      flex: flex,
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => <>{params.value}</>,
    } as GridColumns[number]),

  expiry: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'expiry',
      headerName: 'EXPIRES IN',
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
              color: params.value.gt(0) ? 'text.primary' : 'text.secondary',
            }}
          >
            {progress.isNaN() ? '-' : `${displayFullBN(MinBN(progress, new BigNumber(100)), 2, 2)}%`}
          </Typography>
        );
      },
    } as GridColumns[number]),

  amountBeans: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'amountBeans',
      headerName: 'TOTAL',
      flex: flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Box display="inline-flex" sx={{ gap: 0.25, alignItems: 'center' }}>
            <TokenIcon token={BEAN[1]} />
            {displayBN(params.value || ZERO_BN)}
          </Box>
        ) : '-'
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

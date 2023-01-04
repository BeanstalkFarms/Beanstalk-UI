import React from 'react';
import {
  GridColumns,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { Box, Link, Tooltip, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { PodListing, PodOrder, PricingType } from '~/state/farmer/market';
import { displayBN, displayFullBN, MaxBN, MinBN } from '~/util';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';
import { ZERO_BN } from '~/constants';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import { FarmerMarketOrder } from '~/hooks/farmer/market/useFarmerMarket2';
import etherscanIcon from '~/img/beanstalk/interface/nav/etherscan.svg';
import EntityIcon from '~/components/Market/PodsV2/Common/EntityIcon';
import { MarketEvent } from '~/hooks/beanstalk/useMarketActivityData';

/// ////////////////////////// Constants /////////////////////////////

const MARKET_STATUS_TO_COLOR = {
  active: BeanstalkPalette.logoGreen,
  cancelled: 'text.secondary',
};

const iconSx = {
  width: 14,
  height: 14,
};

const MARKET_EVENT_TO_ICON = {
  // fill: '💰',
  fill: <SwapHorizIcon sx={iconSx} />,
  // create: '✏️',
  create: <AddCircleOutlineIcon sx={iconSx} />,
  // cancel: '❌',
  cancel: <DoNotDisturbIcon sx={iconSx} />
  // unknown: undefined,
};

/// ////////////////////////// Utilities /////////////////////////////

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

/// ////////////////////////// Columns /////////////////////////////

export const MarketColumns = {
  Shared: {
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
          <Typography color="text.secondary" sx={{ fontSize: 'inherit' }}>
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
          params.value?.gt(0) ? (
            <Row display="inline-flex" gap={0.25} alignItems="center">
              <TokenIcon token={BEAN[1]} />
              <span>{displayBN(params.value || ZERO_BN)}</span>
            </Row>
          ) : '-'
        ),
      } as GridColumns[number])
  },
  ActivityItem: {
    /** create | cancel | fill */
    labelAction: (flex: number, align?: 'left' | 'right') =>
      ({
        field: 'action',
        headerName: 'ACTION',
        flex: flex,
        align: align || 'left',
        headerAlign: align || 'left',
        renderCell: (params: GridRenderCellParams<string, MarketEvent>) => (
          params.value
            ? (
              <Row gap={0.2}>
                {MARKET_EVENT_TO_ICON[params.value as keyof typeof MARKET_EVENT_TO_ICON]}
                <span>{params.value.toUpperCase()}</span>
              </Row>
            )
            : '-'
        ),
      } as GridColumns[number]),
  },
  HistoryItem: {
    /** order | listing */
    labelType: (flex: number, align?: 'left' | 'right') =>
      ({
        field: 'type',
        headerName: 'TYPE',
        flex: flex,
        align: align || 'left',
        headerAlign: align || 'left',
        renderCell: (params: GridRenderCellParams) => (
          <>
            <EntityIcon type={params.value} size={12} sx={{ marginRight: 0.5 }} />
            {params.value.toString().toUpperCase()}
          </>
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
        renderCell: (params: GridRenderCellParams<any, FarmerMarketOrder>) => {
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
            key in MARKET_STATUS_TO_COLOR
              ? MARKET_STATUS_TO_COLOR[key as keyof typeof MARKET_STATUS_TO_COLOR]
              : 'text.primary';

          return (
            <Typography sx={{ fontSize: 'inherit', color: color }}>
              {params.value.toString().toUpperCase()}
            </Typography>
          );
        },
      } as GridColumns[number]),
  },
  PodListing: {
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
          <>
            <Typography
              sx={{ fontSize: 'inherit' }}
              display={{ xs: 'none', md: 'block' }}
            >
              {displayFullBN(new BigNumber(params.value), 0)}
            </Typography>
            <Typography
              sx={{ fontSize: 'inherit' }}
              display={{ xs: 'block', md: 'none' }}
            >
              {displayBN(new BigNumber(params.value))}
            </Typography>
          </>
        ),
      } as GridColumns[number]),
    
    remainingAmount: (flex: number, align?: 'left' | 'right') =>
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
  },
  PodOrder: {
    /** */
    orderId: (flex: number, align?: 'left' | 'right') =>
      ({
        field: 'id',
        headerName: 'Order',
        flex,
        align: align || 'left',
        headerAlign: align || 'left',
        renderCell: (params: GridRenderCellParams<any, PodOrder>) => (
          <>{params.row.id.substring(0, 8)}</>
        ),
      } as GridColumns[number]),
    
    /** */
    podAmountRemaining: (flex: number, align?: 'left' | 'right') =>
      ({
        field: 'podAmountRemaining',
        headerName: 'AMOUNT',
        type: 'number',
        flex: flex,
        align: align || 'right',
        headerAlign: align || 'right',
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            placement="right"
            title={
              <Typography sx={{ fontSize: FontSize.sm }}>
                Total Value:{' '}
                {displayFullBN(
                  (params.value as BigNumber).times(params.row.pricePerPod),
                  BEAN[1].displayDecimals
                )}{' '}
                BEAN
              </Typography>
            }
          >
            <Row gap={0.3}>
              <TokenIcon token={PODS} />
              <Typography sx={{ fontSize: 'inherit' }}>
                {/* {JSON.stringify(params.row)} */}
                {displayBN(params.value)}
              </Typography>
            </Row>
          </Tooltip>
        ),
      } as GridColumns[number]),

    /** For orders, place in line is a range from 0 - maxPlaceInLine. */
    maxPlaceInLine: (flex: number, align?: 'left' | 'right') =>
      ({
        field: 'maxPlaceInLine',
        headerName: 'Place in Line',
        type: 'number',
        flex: flex,
        align: align || 'left',
        headerAlign: align || 'left',
        valueGetter: (params: GridRenderCellParams) =>
          (params.value as BigNumber).toNumber(),
        renderCell: (params: GridRenderCellParams) => (
          <>
            <Typography
              sx={{ fontSize: 'inherit' }}
              display={{ xs: 'none', md: 'block' }}
            >
              0 - {displayFullBN(new BigNumber(params.value), 0)}
            </Typography>
            <Typography
              sx={{ fontSize: 'inherit' }}
              display={{ xs: 'block', md: 'none' }}
            >
              0 - {displayBN(new BigNumber(params.value))}
            </Typography>
          </>
        ),
      } as GridColumns<FarmerMarketOrder>[number]),
  }
};

const MARKET_COLUMNS = {
  // pricePerPod: (flex: number, align?: 'left' | 'right') =>
  //   ({
  //     field: 'pricePerPod',
  //     headerName: 'Price per Pod',
  //     type: 'number',
  //     flex,
  //     align: align || 'left',
  //     headerAlign: align || 'left',
  //     renderCell: (params: GridRenderCellParams) => (
  //       <Row gap={0.25}>
  //         <TokenIcon token={BEAN[1]} />
  //         <Typography sx={{ fontSize: 'inherit' }}>
  //           {displayFullBN(params.value)}
  //         </Typography>
  //       </Row>
  //     ),
  //   } as GridColumns[number]),
};

export default MARKET_COLUMNS;

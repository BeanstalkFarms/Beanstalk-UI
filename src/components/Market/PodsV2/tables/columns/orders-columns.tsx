import React from 'react';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { PodOrder } from '~/state/farmer/market';
import Row from '~/components/Common/Row';
import EntityIcon from '~/components/Market/Pods/EntityIcon';
import { displayBN, displayFullBN } from '~/util';
import TokenIcon from '~/components/Common/TokenIcon';
import { BEAN, PODS } from '~/constants/tokens';

const MARKET_ORDER_COLUMNS = {
  orderId: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'id',
      headerName: 'Order',
      flex,
      align: align || 'left',
      headerAlign: align || 'left',
      renderCell: (params: GridRenderCellParams<any, PodOrder>) => (
        <Tooltip placement="right" title="">
          <Row gap={1}>
            <EntityIcon type="buy" />
            <Typography
              display={{ xs: 'none', md: 'block' }}
              sx={{ fontSize: 'inherit' }}
            >
              {params.row.id.substring(0, 8)}
            </Typography>
          </Row>
        </Tooltip>
      ),
    } as GridColumns[number]),

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
        <Typography sx={{ fontSize: 'inherit' }} component="span">
          <Box display={{ xs: 'none', md: 'block' }}>
            0 - {displayFullBN(new BigNumber(params.value), 0)}
          </Box>
          <Box display={{ xs: 'block', md: 'none' }}>
            0 - {displayBN(new BigNumber(params.value))}
          </Box>
        </Typography>
      ),
    } as GridColumns[number]),

  pricePerPod: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'pricePerPod',
      headerName: 'Price per Pod',
      type: 'number',
      align: align || 'left',
      headerAlign: align || 'left',
      flex: flex,
      renderCell: (params: GridRenderCellParams<any, PodOrder>) => (
        <Row gap={0.3}>
          <TokenIcon token={BEAN[1]} />
          <Typography>{displayFullBN(params.value)}</Typography>
        </Row>
      ),
    } as GridColumns[number]),

  numPods: (flex: number, align?: 'left' | 'right') =>
    ({
      field: 'totalAmount',
      headerName: 'Amount',
      type: 'number',
      flex: flex,
      // disableColumnMenu: true,
      align: align || 'right',
      headerAlign: align || 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip
          placement="right"
          title={
            <>
              Total Value:{' '}
              {displayFullBN(
                (params.value as BigNumber).times(params.row.pricePerPod),
                BEAN[1].displayDecimals
              )}{' '}
              BEAN
            </>
          }
        >
          <Row gap={0.3}>
            <TokenIcon token={PODS} />
            <Typography sx={{ fontSize: 'inherit' }}>
              {displayBN(params.value)}
            </Typography>
          </Row>
        </Tooltip>
      ),
    } as GridColumns[number]),
};

export default MARKET_ORDER_COLUMNS;

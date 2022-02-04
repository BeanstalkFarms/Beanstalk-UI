import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
// import BigNumber from 'bignumber.js';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
} from '@material-ui/core';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
} from '@material-ui/icons';

import { PodOrder } from 'state/marketplace/reducer';
import { BEAN, theme } from 'constants/index';
import { cancelPodOrder, CryptoAsset, displayBN, FarmAsset, toStringBaseUnitBN } from 'util/index';

import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule, TransactionToast } from 'components/Common';
import { useStyles } from '../TableStyles';

type OrderRowProps = {
  order: PodOrder;
  seCurrentOrder: Function;
  isMine: boolean;
}

function OrderRow({ order, seCurrentOrder, isMine }: OrderRowProps) {
  const classes = useStyles();
  // const { plots } = useSelector<AppState, AppState['userBalance']>(
  //   (state) => state.userBalance
  // );
  const numPodsLeft = order.remainingAmount;
  const explainer = (
    <>
      {isMine
        ? 'You want'
        : (
          <>
            <a href={`https://etherscan.io/address/${order.account}`} target="_blank" rel="noreferrer">{order.account.slice(0, 6)}</a> wants
          </>
        )} to buy {displayBN(numPodsLeft)} Pods for {displayBN(order.pricePerPod)} Beans per Pod anywhere before {displayBN(order.maxPlaceInLine)} in the Pod line.
    </>
  );
  /** Do we have any plots whose index is smaller than max place in line? if so then we can sell */
  // const canSell = Object.keys(plots).some((index) => order.maxPlaceInLine.minus(new BigNumber(plots[index])).gt(0));

  return (
    <TableRow>
      {/* Place in line */}
      <TableCell className={classes.lucidaStyle}>
        <span>0 — {displayBN(order.maxPlaceInLine)}</span>
        <QuestionModule
          description={explainer}
          style={{ marginLeft: 10 }}
          placement="right"
          position="static"
          widthTooltip={200}
          fontSize="12px"
          margin="-10px 0 0 10px"
        />
      </TableCell>
      {/* Price per pod */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Beans per Pod"
        balance={order.pricePerPod}
        icon={<TokenIcon token={CryptoAsset.Bean} />}
      >
        {order.pricePerPod.toFixed(2)}
      </BalanceTableCell>
      {isMine ? (
        <>
          {/* Amount filled so far */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Bought"
            balance={order.filledAmount}
            icon={<TokenIcon token={FarmAsset.Pods} />}
          >
            {displayBN(order.filledAmount)} / {displayBN(order.totalAmount)}
          </BalanceTableCell>
          {/* Cancel this Order */}
          <TableCell align="center">
            <IconButton
              onClick={async () => {
                // Toast
                const txToast = new TransactionToast({
                  loading: `Cancelling order for ${displayBN(numPodsLeft)} Pods at ${displayBN(order.pricePerPod)} Beans per Pod`,
                  success: 'Order cancelled',
                });

                // Execute
                cancelPodOrder({
                  pricePerPod: toStringBaseUnitBN(order.pricePerPod, BEAN.decimals),
                  maxPlaceInLine: toStringBaseUnitBN(order.maxPlaceInLine, BEAN.decimals),
                  toWallet: false,
                }, (response) => txToast.confirming(response))
                .then((value) => {
                  txToast.success(value);
                })
                .catch((err) => {
                  txToast.error(err);
                });
              }}
              style={{
                color: theme.linkColor,
              }}
              size="small"
            >
              <CancelIcon />
            </IconButton>
          </TableCell>
        </>
      ) : (
        <>
          {/* # of pods remaining in this Order */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Requested"
            balance={order.totalAmount.minus(order.filledAmount)}
            icon={<TokenIcon token={FarmAsset.Pods} />}
          >
            {displayBN(numPodsLeft)}
          </BalanceTableCell>
          {/* Sell into this Order; only show if handler is set */}
          {seCurrentOrder && (
            <TableCell align="center">
              <IconButton
                onClick={() => seCurrentOrder(order)}
                // disabled={!canSell}
                // style={{
                //   color: canSell ? theme.linkColor : 'lightgray',
                // }}
                style={{
                  color: theme.linkColor,
                }}
                size="small"
              >
                <ShoppingCartIcon />
              </IconButton>
            </TableCell>
          )}
        </>
      ) }
    </TableRow>
  );
}

type OrdersTableProps = {
  mode: 'ALL' | 'MINE';
  orders: PodOrder[];
  seCurrentOrder?: Function;
}

/**
 * Orders
 */
export default function OrdersTable(props: OrdersTableProps) {
  const classes = useStyles();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  /** */
  const [page, setPage] = useState<number>(0);

  if (!props.orders || props.orders.length === 0) {
    return (
      <div>
        <h4 style={{ }}>No active orders given the current filters</h4>
      </div>
    );
  }

  //
  const rowsPerPage = 5;
  const slicedItems = props.orders
    .sort((a, b) => a.maxPlaceInLine - b.maxPlaceInLine)
    .slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

  if (props.mode === 'MINE') {
    return (
      <>
        <TableContainer>
          <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  Place in line
                </TableCell>
                <TableCell align="right">
                  Price
                </TableCell>
                <TableCell align="right">
                  Pods Bought
                </TableCell>
                <TableCell align="center">
                  Cancel
                </TableCell>
              </TableRow>
            </TableHead>
            {slicedItems.map((order: PodOrder) => (
              <OrderRow
                key={order.id}
                order={order}
                seCurrentOrder={props.seCurrentOrder}
                isMine
              />
            ))}
          </Table>
        </TableContainer>
        {/* display page button if user has more Orders than rowsPerPage. */}
        {Object.keys(props.orders).length > rowsPerPage
          ? (
            <TablePagination
              component="div"
              count={props.orders.length}
              onPageChange={(event, p) => setPage(p)}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, count }) =>
                `${Math.ceil(from / rowsPerPage)}-${
                  count !== -1 ? Math.ceil(count / rowsPerPage) : 0
                }`
              }
            />
          )
          : null}
      </>
    );
  }

  return (
    <>
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">
                Place in line
              </TableCell>
              <TableCell align="right">
                Price
              </TableCell>
              <TableCell align="right">
                Pods Requested
              </TableCell>
              {props.seCurrentOrder && (
                <TableCell align="center">
                  Sell
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          {slicedItems.map((order: PodOrder) => (
            <OrderRow
              key={order.id}
              order={order}
              seCurrentOrder={props.seCurrentOrder}
            />
          ))}
        </Table>
      </TableContainer>
      {/* display page button if user has more Orders than rowsPerPage. */}
      {Object.keys(props.orders).length > rowsPerPage
        ? (
          <TablePagination
            component="div"
            count={props.orders.length}
            onPageChange={(event, p) => setPage(p)}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, count }) =>
              `${Math.ceil(from / rowsPerPage)}-${
                count !== -1 ? Math.ceil(count / rowsPerPage) : 0
              }`
            }
          />
        )
        : null}
    </>
  );
}

OrdersTable.defaultProps = {
  seCurrentOrder: undefined,
};

import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Radio,
  Button,
  Popover,
  Box,
  TableBody
} from '@mui/material';
import {
  CloseOutlined as CancelIcon,
} from '@mui/icons-material';

import { PodOrder } from 'state/marketplace/reducer';
import { BEAN } from 'constants/index';
import { cancelPodOrder, CryptoAsset, displayBN, FarmAsset, toStringBaseUnitBN } from 'util/index';

import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule, settingsStrings, SwitchModule, TablePageSelect, TransactionToast } from 'components/Common';
import { useStyles } from '../TableStyles';

type OrderRowProps = {
  order: PodOrder;
  isMine: boolean;
  selectedOrderKey?: number;
  handleOrderChange?: Function;
  setSelectedOrderKey?: Function;
  isSelling?: boolean;
}

function OrderRow({ order, isMine, selectedOrderKey, handleOrderChange, isSelling, setSelectedOrderKey }: OrderRowProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [toWallet, setToWallet] = useState(false);
  const numPodsLeft = order.remainingAmount;
  const explainer = (
    <>
      {isMine
        ? 'You want'
        : (
          <>
            <a href={`https://etherscan.io/address/${order.account}`} target="_blank" rel="noreferrer">{order.account.slice(0, 6)}</a> wants
          </>
        )} to buy {displayBN(numPodsLeft)} Pod{numPodsLeft.eq(1) ? '' : 's'} for {displayBN(order.pricePerPod)} Beans per Pod anywhere before {displayBN(order.maxPlaceInLine)} in the Pod Line.
    </>
  );

  const cancelOrder = async () => {
    // Toast
    const destination = toWallet ? 'to your wallet' : 'to your Claimable balance';
    const beansReturned = displayBN(numPodsLeft.times(order.pricePerPod));
    const txToast = new TransactionToast({
      loading: `Cancelling order for ${displayBN(numPodsLeft)} Pods at ${displayBN(order.pricePerPod)} Beans per Pod. Returning ${beansReturned} Beans ${destination}.`,
      success: `Order cancelled. Sent ${beansReturned} Beans ${destination}.`,
    });

    // Execute
    cancelPodOrder({
      pricePerPod: toStringBaseUnitBN(order.pricePerPod, BEAN.decimals),
      maxPlaceInLine: toStringBaseUnitBN(order.maxPlaceInLine, BEAN.decimals),
      toWallet,
    }, (response) => txToast.confirming(response))
    .then((value) => {
      txToast.success(value);
    })
    .catch((err) => {
      txToast.error(err);
    });
  };

  return (
    <TableRow
      hover={!isMine && !isSelling}
      onClick={!isMine && !isSelling ? () => setSelectedOrderKey(order.id) : null}
      style={!isMine && !isSelling ? { cursor: 'pointer' } : null}
    >
      {/* Place in line */}
      <TableCell className={classes.lucidaStyle}>
        <span>0 — {displayBN(order.maxPlaceInLine)}</span>
        <QuestionModule
          description={explainer}
          placement="right"
          fontSize="11px"
          margin="-4px 0 0 5px"
        />
      </TableCell>
      {/* Price per pod */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Beans per Pod"
        balance={order.pricePerPod}
        icon={<TokenIcon token={CryptoAsset.Bean} />}
      >
        {order.pricePerPod.toFixed(3)}
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
              onClick={(event) => setAnchorEl(event.currentTarget)}
              className={classes.iconButton}
              size="small"
            >
              <CancelIcon />
            </IconButton>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box sx={{ p: 2 }}>
                <SwitchModule
                  description={settingsStrings.toWalletCancelOrder}
                  label="To Wallet"
                  margin="-55px 0px 0px 20px"
                  setValue={(value) => setToWallet(value)}
                  value={toWallet}
                  style={{ textAlign: 'center' }}
                  formControlStyles={{ paddingBottom: 5 }}
                />
                <Button onClick={cancelOrder} variant="contained" className={classes.marginTop15}>
                  Cancel Order
                </Button>
              </Box>
            </Popover>
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
          {handleOrderChange && selectedOrderKey !== null && !isSelling && (
            <TableCell align="center">
              <Radio
                checked={selectedOrderKey === order.id}
                onChange={handleOrderChange}
                value={order.id}
                name="radio-buttons"
                inputProps={{ 'aria-label': order.id }}
              />
            </TableCell>
          )}
        </>
      )}
    </TableRow>
  );
}

type OrdersTableProps = {
  mode: 'ALL' | 'MINE';
  orders: PodOrder[];
  seCurrentOrder?: Function;
  isSelling?: boolean;
}

/**
 * Orders
 */
export default function OrdersTable(props: OrdersTableProps) {
  const [page, setPage] = useState<number>(0);
  const [selectedOrderKey, setSelectedOrderKey] = React.useState<string>('');
  const handleOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOrderKey((event.target.value));
  };
  const classes = useStyles();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  if (!props.orders || props.orders.length === 0) {
    return (
      <div>
        <h4 style={{ }}>No active Orders given the current filters</h4>
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
          <TableBody>
            {slicedItems.map((order: PodOrder) => (
              <OrderRow
                key={order.id}
                order={order}
                selectedOrderKey={selectedOrderKey}
                setSelectedOrderKey={setSelectedOrderKey}
                handleOrderChange={handleOrderChange}
                isSelling={props.isSelling}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
        { !props.isSelling &&
          <Button
            className={classes.formButton}
            style={{ marginTop: '8px', textAlign: 'center' }}
            color="primary"
            disabled={
              !selectedOrderKey
            }
            variant="contained"
            onClick={() => {
              props.seCurrentOrder(slicedItems.find((order) => order.id === selectedOrderKey));
            }}
          >
            {selectedOrderKey ? 'Fill Order' : 'Select Order to Fill'}
          </Button>
        }
      </div>
      {/* display page button if user has more Orders than rowsPerPage. */}
      {Object.keys(props.orders).length > rowsPerPage
        ? (
          <TablePagination
            component="div"
            count={props.orders.length}
            onPageChange={(event, p) => { setPage(p); setSelectedOrderKey(''); }}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, count }) =>
              `${Math.ceil(from / rowsPerPage)}-${
                count !== -1 ? Math.ceil(count / rowsPerPage) : 0
              }`
            }
            ActionsComponent={
              Object.keys(props.orders).length > (rowsPerPage * 2)
                ? TablePageSelect
                : undefined
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

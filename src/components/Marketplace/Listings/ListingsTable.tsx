import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
} from '@material-ui/icons';
import {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  IconButton,
  // CircularProgress,
  TablePagination,
} from '@material-ui/core';

import { Listing } from 'state/marketplace/reducer';
import { theme, BEAN } from 'constants/index';
import { displayBN, toStringBaseUnitBN, FarmAsset, CryptoAsset, cancelListing } from 'util/index';

import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule, TransactionToast } from 'components/Common';
import { useStyles } from '../TableStyles';

type ListingRowProps = {
  listing: Listing;
  harvestableIndex: AppState['weather']['harvestableIndex'];
  setCurrentListing: Function;
  enableControls: boolean;
  isMine: boolean;
}

function ListingRow({
  listing,
  harvestableIndex,
  setCurrentListing,
  enableControls,
  isMine,
}: ListingRowProps) {
  const classes = useStyles();
  const relativeIndex = (listing.objectiveIndex).minus(harvestableIndex);
  const relativeExpiry = (listing.expiry).minus(new BigNumber(harvestableIndex));
  const amountRemaining = listing.initialAmount.minus(listing.amountSold);
  const explainer = (
    <>
      {isMine
        ? 'You want'
        : (
          <>
            <a href={`https://etherscan.io/address/${listing.listerAddress}`} target="_blank" rel="noreferrer">{listing.listerAddress.slice(0, 6)}</a> wants
          </>
        )
      } to sell {displayBN(amountRemaining)} Pods at {displayBN(relativeIndex)} in the pod line for {displayBN(listing.pricePerPod)} Beans per Pod. If the pod line moves forward by {displayBN(relativeExpiry)} Pods, this listing will automatically expire.
    </>
  );
  return (
    <TableRow>
      {/* Place in line */}
      <TableCell
        align="left"
        className={classes.lucidaStyle}
      >
        {displayBN(relativeIndex)}
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
      {/* # of pods remaining to harvest before this offer to sell expires */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label={`- If the pod line moves forward ${displayBN(relativeExpiry)} Pods, this listing will automatically expire.`}
        balance={new BigNumber(relativeExpiry)}
      />
      {/* Price */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Beans per Pod"
        balance={listing.pricePerPod}
        icon={<TokenIcon token={CryptoAsset.Bean} />}
      >
        {listing.pricePerPod.toFixed(2)}
      </BalanceTableCell>
      {isMine ? (
        <>
          {/* Pods Filled */}
          <TableCell
            className={classes.lucidaStyle}
            align="right"
          >
            <span>
              {`${displayBN(listing.amountSold)} / ${displayBN(listing.initialAmount)}`}
            </span>
            <TokenIcon token={FarmAsset.Pods} />
            {/* Disabling the progress bar for now - it feels out of place next to the
                the Pod icon, and since we already show listing.amountSold the user can easily
                eyeball how much of their plot has sold. Will discuss a UI for this with the design team. -SC */}
            {/* listing.amountSold > 0 && (
              // TODO: add a tooltip when you hover over this
              // TODO: move this to the front of the row?
              <CircularProgress
                variant="determinate"
                value={
                  // Cap this at 93; over 93 it just looks like a ring, hard to tell it's a
                  // progress bar!
                  Math.min(
                    (listing.amountSold).dividedBy(listing.initialAmount).toNumber() * 100,
                    93
                  )
                }
                size={12}
                thickness={4}
                style={{ opacity: 0.7, height: 10 }}
              />
              ) */}
          </TableCell>
          {/* Cancel Button */}
          {enableControls && (
            <TableCell align="center">
              <IconButton
                onClick={async () => {
                  // Toast
                  const txToast = new TransactionToast({
                    loading: `Cancelling listing with ${displayBN(amountRemaining)} Pods remaining at ${displayBN(relativeIndex)} in line`,
                    success: 'Listing cancelled',
                  });

                  // Execute
                  cancelListing(
                    toStringBaseUnitBN(listing.objectiveIndex, BEAN.decimals),
                    (response) => txToast.confirming(response),
                  )
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
          )}
        </>
      ) : (
        <>
          {/* Amount */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            balance={amountRemaining}
            label="Pods"
            icon={<TokenIcon token={FarmAsset.Pods} />}
          />
          {/* Buy this listing; only show if handler is set */}
          {setCurrentListing && (
            <TableCell align="center">
              <IconButton
                onClick={() => setCurrentListing(listing)}
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
      )}
    </TableRow>
  );
}

type ListingsTableProps = {
  mode: 'ALL' | 'MINE';
  enableControls?: boolean;
  listings: Listing[];
  setCurrentListing?: Function;
  harvestableIndex: BigNumber;
}

/**
 * A Listing = an Offer to Sell.
 * A User can purchase the Pods in a Listing.
 */
export default function ListingsTable(props: ListingsTableProps) {
  const classes = useStyles();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  /** */
  const [page, setPage] = useState<number>(0);

  if (!props.listings || props.listings.length === 0) {
    return (
      <div>
        <h4 style={{ }}>No active listings given the current filters</h4>
      </div>
    );
  }

  //
  const rowsPerPage = 5;
  const slicedItems = props.listings
    .sort((a, b) => a.objectiveIndex - b.objectiveIndex)
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
                <TableCell align="left">Place in line</TableCell>
                <TableCell align="right">Expiry</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Pods Sold</TableCell>
                {props.enableControls ? (
                  <TableCell align="center">Cancel</TableCell>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {slicedItems.map((listing: Listing) => (
                <ListingRow
                  key={listing.objectiveIndex - props.harvestableIndex}
                  harvestableIndex={props.harvestableIndex}
                  listing={listing}
                  setCurrentListing={props.setCurrentListing}
                  enableControls={props.enableControls}
                  isMine
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* display page button if user has more listings than rowsPerPage. */}
        {Object.keys(props.listings).length > rowsPerPage
          ? (
            <TablePagination
              component="div"
              count={props.listings.length}
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
                Expiry
              </TableCell>
              <TableCell align="right">
                Price
              </TableCell>
              <TableCell align="right">
                Amount
              </TableCell>
              {props.setCurrentListing && (
                <TableCell align="center">
                  Buy
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {slicedItems.map((listing: Listing) => (
              <ListingRow
                key={listing.objectiveIndex - props.harvestableIndex}
                harvestableIndex={props.harvestableIndex}
                listing={listing}
                setCurrentListing={props.setCurrentListing}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* display page button if user has more listings than rowsPerPage. */}
      {Object.keys(props.listings).length > rowsPerPage
        ? (
          <TablePagination
            component="div"
            count={props.listings.length}
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

ListingsTable.defaultProps = {
  enableControls: true,
  setCurrentListing: undefined,
};

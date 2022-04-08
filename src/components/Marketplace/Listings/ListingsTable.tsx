import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  CloseOutlined as CancelIcon,
} from '@material-ui/icons';
import {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  Radio,
  Button
} from '@material-ui/core';

import { PodListing } from 'state/marketplace/reducer';
import { BEAN } from 'constants/index';
import { displayBN, toStringBaseUnitBN, FarmAsset, CryptoAsset, cancelPodListing } from 'util/index';

import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule, TablePageSelect, TransactionToast } from 'components/Common';
import { useStyles } from '../TableStyles';

type ListingRowProps = {
  listing: PodListing;
  harvestableIndex: AppState['weather']['harvestableIndex'];
  enableControls: boolean;
  isMine: boolean;
  setSelectedListingIndex?: Function;
  selectedListingIndex?: string;
  handleListingChange?: Function;
  isBuying?: boolean;
}

function ListingRow({
  listing,
  harvestableIndex,
  enableControls,
  isMine,
  setSelectedListingIndex,
  selectedListingIndex,
  handleListingChange,
  isBuying,
}: ListingRowProps) {
  const classes = useStyles();
  const relativeIndex = (listing.index).minus(harvestableIndex).plus(listing.start);
  const relativeExpiry = (listing.maxHarvestableIndex).minus(new BigNumber(harvestableIndex)).plus(listing.start);
  const amountRemaining = listing.totalAmount.minus(listing.filledAmount);
  const explainer = (
    <>
      {isMine
        ? 'You want'
        : (
          <>
            <a href={`https://etherscan.io/address/${listing.account}`} target="_blank" rel="noreferrer">{listing.account.slice(0, 6)}</a> wants
          </>
        )
      } to sell {displayBN(amountRemaining)} Pod{amountRemaining.eq(1) ? '' : 's'} at {displayBN(relativeIndex)} in the Pod Line for {displayBN(listing.pricePerPod)} Beans per Pod. If the Pod Line moves forward by {displayBN(relativeExpiry)} Pods, this Pod Listing will automatically expire.
    </>
  );
  return (
    <TableRow
      hover={!isMine && !isBuying}
      onClick={(!isMine && !isBuying) ? () => setSelectedListingIndex(listing.index.toString()) : null}
      style={!isMine && !isBuying ? { cursor: 'pointer' } : null}
    >
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
      {/* # of pods remaining to harvest before this order to sell expires */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label={`- If the Pod Line moves forward ${displayBN(relativeExpiry)} Pods, this Listing will automatically expire.`}
        balance={new BigNumber(relativeExpiry)}
      />
      {/* Price */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Beans per Pod"
        balance={listing.pricePerPod}
        icon={<TokenIcon token={CryptoAsset.Bean} />}
      >
        {listing.pricePerPod.toFixed(3)}
      </BalanceTableCell>
      {isMine ? (
        <>
          {/* Pods Filled */}
          <TableCell
            className={classes.lucidaStyle}
            align="right"
          >
            <span>
              {`${displayBN(listing.filledAmount)} / ${displayBN(listing.totalAmount)}`}
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
                    loading: `Cancel Listing with ${displayBN(amountRemaining)} Pods remaining at ${displayBN(relativeIndex)} in the Pod Line pending.`,
                    success: `Cancel Listing with ${displayBN(amountRemaining)} Pods remaining at ${displayBN(relativeIndex)} in the Pod Line successful.`,
                  });

                  // Execute
                  cancelPodListing({
                    index: toStringBaseUnitBN(listing.index, BEAN.decimals),
                  }, (response) => {
                    txToast.confirming(response);
                  })
                  .then((value) => {
                    txToast.success(value);
                  })
                  .catch((err) => {
                    txToast.error(err);
                  });
                }}
                className={classes.iconButton}
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
          {handleListingChange && selectedListingIndex !== null && !isBuying && (
            <TableCell align="center">
              <Radio
                checked={selectedListingIndex === listing.index.toString()}
                onChange={handleListingChange}
                value={listing.index}
                name="radio-buttons"
                inputProps={{ 'aria-label': toStringBaseUnitBN(listing.index, BEAN.decimals) }}
            />
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
  listings: PodListing[];
  setCurrentListing?: Function;
  harvestableIndex: BigNumber;
  isBuying?: boolean;
}

/**
 * A Listing = an Order to Sell.
 * A User can purchase the Pods in a Listing.
 */
export default function ListingsTable(props: ListingsTableProps) {
  const [selectedListingIndex, setSelectedListingIndex] = React.useState<string>('');
  const handleListingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedListingIndex((event.target.value));
  };

  const classes = useStyles();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  /** */
  const [page, setPage] = useState<number>(0);
  const filteredListings = props.listings.filter((listing) => listing?.remainingAmount?.gt(0.0001));

  if (!filteredListings || filteredListings.length === 0) {
    return (
      <div>
        <h4>No active listings given the current filters</h4>
      </div>
    );
  }

  //
  const rowsPerPage = 5;
  const slicedItems = filteredListings
    .sort((a, b) => a.index - b.index)
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
              {slicedItems.map((listing: PodListing) => (
                <ListingRow
                  key={listing.index - props.harvestableIndex}
                  harvestableIndex={props.harvestableIndex}
                  listing={listing}
                  enableControls={props.enableControls}
                  isMine
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* display page button if user has more listings than rowsPerPage. */}
        {Object.keys(filteredListings).length > rowsPerPage
          ? (
            <TablePagination
              component="div"
              count={filteredListings.length}
              onPageChange={(event, p) => setPage(p)}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, count }) =>
                `${Math.ceil(from / rowsPerPage)}-${
                  count !== -1 ? Math.ceil(count / rowsPerPage) : 0
                }`
              }
              ActionsComponent={
                Object.keys(filteredListings).length > (rowsPerPage * 2)
                  ? TablePageSelect
                  : undefined
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
            {slicedItems.map((listing: PodListing) => (
              <ListingRow
                key={listing.index - props.harvestableIndex}
                harvestableIndex={props.harvestableIndex}
                listing={listing}
                setSelectedListingIndex={setSelectedListingIndex}
                selectedListingIndex={selectedListingIndex}
                handleListingChange={handleListingChange}
                isBuying={props.isBuying}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
        { !props.isBuying &&
          <Button
            className={classes.formButton}
            style={{ marginTop: '8px', textAlign: 'center' }}
            color="primary"
            disabled={
              !selectedListingIndex
            }
            variant="contained"
            onClick={() => { 
              props.setCurrentListing(
                slicedItems.find((listing) => listing.index.toString() === selectedListingIndex)
              );
            }}
          >
            {selectedListingIndex ? 'Buy Pods' : 'Select Pods to Buy'}
          </Button>
        }
      </div>
      {/* display page button if user has more listings than rowsPerPage. */}
      {Object.keys(filteredListings).length > rowsPerPage
        ? (
          <TablePagination
            component="div"
            count={filteredListings.length}
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

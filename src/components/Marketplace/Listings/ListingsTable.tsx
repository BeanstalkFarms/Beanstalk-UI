import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  FilterListRounded as FilterIcon,
} from '@material-ui/icons';
import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Popover,
  Slider,
  CircularProgress,
} from '@material-ui/core';

import { theme, BEAN } from 'constants/index';
import { beanstalkContract, GetWalletAddress, displayBN, toStringBaseUnitBN, FarmAsset, CryptoAsset } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule } from 'components/Common';
import { BuyListingModal } from './BuyListingModal';
import { useStyles } from '../TableStyles';
import { Listing } from 'state/marketplace/reducer';

function ListingRow({ listing, harvestableIndex, setListing, isMine }) {
  const classes = useStyles();
  const relativeIndex = (listing.objectiveIndex).minus(harvestableIndex);
  const relativeExpiry = (listing.expiry).minus(new BigNumber(harvestableIndex));
  const amountRemaining = listing.initialAmount.minus(listing.amountSold);
  const explainer = `${isMine ? 'You want' : `${listing.listerAddress.slice(0, 6)} wants`} to sell ${displayBN(amountRemaining)} Pods at ${displayBN(relativeIndex)} in the pod line for ${displayBN(listing.pricePerPod)} Beans per Pod. If the pod line moves forward by ${displayBN(relativeExpiry)} Pods, this listing will automatically expire.`;
  return (
    <TableRow>
      {/* Place in line */}
      <TableCell
        align="left"
        className={classes.lucidaStyle}
      >
        {displayBN(relativeIndex)}
        <QuestionModule description={explainer} style={{ marginLeft: 10 }} position="static" />
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
      />
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
            {listing.amountSold > 0 && <CircularProgress variant="determinate" value={(listing.amountSold.dividedBy(listing.initialAmount)).toNumber() * 100} />}
          </TableCell>
          {/* Cancel Button */}
          <TableCell align="center">
            <IconButton
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelListing(
                  toStringBaseUnitBN(listing.objectiveIndex, BEAN.decimals)
                );
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
          {/* Amount */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            balance={amountRemaining}
            label="Pods"
            icon={<TokenIcon token={FarmAsset.Pods} />}
          />
          {/* Buy Button */}
          <TableCell align="center">
            <IconButton
              onClick={() => setListing(listing)}
              style={{ color: theme.linkColor }}
              size="small"
            >
              <ShoppingCartIcon />
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

type ListingsTableProps = {
  mode: 'ALL' | 'MINE';
  listings: Listing[];
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

  if (!props.listings || props.listings.length === 0) {
    return (
      <div>
        <h4 style={{ }}>No active listings</h4>
      </div>
    );
  }

  if (props.mode === 'MINE') {
    return (
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Place in line</TableCell>
              <TableCell align="right">Expiry</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Pods Sold</TableCell>
              <TableCell align="center">Cancel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.listings.map((listing: Listing) => (
              <ListingRow
                key={listing.objectiveIndex - props.harvestableIndex}
                harvestableIndex={props.harvestableIndex}
                listing={listing}
                setListing={props.setCurrentListing}
                isMine
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      {/* REMOVED: FILTERS */}
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Place in line</TableCell>
              <TableCell align="right">Expiry</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Buy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.listings.map((listing: Listing) => (
              <ListingRow
                key={listing.objectiveIndex - props.harvestableIndex}
                harvestableIndex={props.harvestableIndex}
                listing={listing}
                setListing={props.setCurrentListing}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

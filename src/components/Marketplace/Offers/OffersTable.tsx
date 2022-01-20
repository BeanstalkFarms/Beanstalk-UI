import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
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

import { BuyOffer } from 'state/marketplace/reducer';
import { theme } from 'constants/index';
import { beanstalkContract, CryptoAsset, displayBN, FarmAsset } from 'util/index';

import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule } from 'components/Common';
import { useStyles } from '../TableStyles';

type OfferRowProps = {
  offer: BuyOffer;
  setCurrentOffer: Function;
  isMine: boolean;
}

function OfferRow({ offer, setCurrentOffer, isMine }: OfferRowProps) {
  const classes = useStyles();
  const { plots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const numPodsLeft = offer.initialAmountToBuy.minus(offer.amountBought);
  const explainer = (
    <>
      {isMine 
        ? 'You want' 
        : (
          <>
            <a href={`https://etherscan.io/address/${offer.listerAddress}`} target="_blank" rel="noreferrer">{offer.listerAddress.slice(0, 6)}</a> wants
          </>
        )} to buy {displayBN(numPodsLeft)} Pods for {displayBN(offer.pricePerPod)} Beans per Pod anywhere before {displayBN(offer.maxPlaceInLine)} in the pod line.
    </>
  );
  /** Do we have any plots whose index is smaller than max place in line? if so then we can sell */
  const canSell = Object.keys(plots).some((index) => offer.maxPlaceInLine.minus(new BigNumber(plots[index])).gt(0));
  
  return (
    <TableRow>
      {/* Place in line */}
      <TableCell className={classes.lucidaStyle}>
        <span>0 — {displayBN(offer.maxPlaceInLine)}</span>
        <QuestionModule
          description={explainer}
          style={{ marginLeft: 10 }}
          placement="right"
          position="static"
          widthTooltip={200}
        />
      </TableCell>
      {/* Price per pod */}
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Price per pod"
        balance={offer.pricePerPod}
        icon={<TokenIcon token={CryptoAsset.Bean} />}
      />
      {isMine ? (
        <>
          {/* Amount filled so far */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Sold"
            balance={offer.amountBought}
            icon={<TokenIcon token={FarmAsset.Pods} />}
          >
            {displayBN(offer.amountBought)} / {displayBN(offer.initialAmountToBuy)}
          </BalanceTableCell>
          {/* Cancel this offer */}
          <TableCell align="center">
            <IconButton
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelBuyOffer(offer.index.toString());
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
          {/* # of pods remaining in this offer */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Available"
            balance={offer.initialAmountToBuy.minus(offer.amountBought)}
            icon={<TokenIcon token={FarmAsset.Pods} />}
          >
            {displayBN(numPodsLeft)}
          </BalanceTableCell>
          {/* Sell into this offer; only show if handler is set */}
          {setCurrentOffer && (
            <TableCell align="center">
              <IconButton
                onClick={() => setCurrentOffer(offer)}
                disabled={!canSell}
                style={{
                  color: canSell ? theme.linkColor : 'lightgray',
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

type OffersTableProps = {
  mode: 'ALL' | 'MINE';
  offers: BuyOffer[];
  setCurrentOffer?: Function;
}

/**
 * Offers ("Offers to Buy")
 */
export default function OffersTable(props: OffersTableProps) {
  const classes = useStyles();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  /** */
  const [page, setPage] = useState<number>(0);

  if (!props.offers || props.offers.length === 0) {
    return (
      <div>
        <h4 style={{ }}>No active bids</h4>
      </div>
    );
  }

  //
  const rowsPerPage = 5;
  const slicedItems = props.offers
    .sort((a, b) => a.maxPlaceInLine - b.maxPlaceInLine)
    .slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

  if (props.mode === 'MINE') {
    return (
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
          {slicedItems.map((offer: BuyOffer) => (
            <OfferRow
              key={offer.index}
              offer={offer}
              setCurrentOffer={props.setCurrentOffer}
              isMine
            />
          ))}
        </Table>
      </TableContainer>
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
              {props.setCurrentOffer && (
                <TableCell align="center">
                  Sell
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          {slicedItems.map((offer: BuyOffer) => (
            <OfferRow
              key={offer.index}
              offer={offer}
              setCurrentOffer={props.setCurrentOffer}
            />
          ))}
        </Table>
      </TableContainer>
      {props.setCurrentOffer && (
        <TablePagination
          component="div"
          count={props.offers.length}
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
      )}
    </>
  );
}

OffersTable.defaultProps = {
  setCurrentOffer: undefined,
};

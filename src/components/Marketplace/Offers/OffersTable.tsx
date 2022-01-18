import React, { useEffect, useState } from 'react';
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
} from '@material-ui/core';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
} from '@material-ui/icons';

import { BuyOffer } from 'state/marketplace/reducer';
import { theme } from 'constants/index';
import { beanstalkContract, CryptoAsset, displayBN, FarmAsset, GetWalletAddress } from 'util/index';

import SellIntoOfferModal from 'components/Marketplace/Offers/SellIntoOfferModal';
import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule } from 'components/Common';
import { useStyles } from '../TableStyles';

type OfferRowProps = {
  offer: BuyOffer;
  setOffer: Function;
  isMine: boolean;
}

function OfferRow({ offer, setOffer, isMine }: OfferRowProps) {
  const classes = useStyles();

  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const { plots } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  // const pctSold = offer.amountBought.dividedBy(offer.initialAmountToBuy);
  const numPodsLeft = offer.initialAmountToBuy.minus(offer.amountBought);
  const explainer = `${isMine ? 'You want' : `${offer.listerAddress.slice(0, 6)} wants`} to buy ${displayBN(numPodsLeft)} Pods for ${displayBN(offer.pricePerPod)} Beans per Pod anywhere before ${displayBN(offer.maxPlaceInLine.minus(harvestableIndex))} in the pod line.`;

  // filter out offers that have cleared the podline
  const relativeMaxPlaceInLine = offer.maxPlaceInLine.minus(harvestableIndex);
  if (relativeMaxPlaceInLine.lt(0)) {
    return null;
  }

  // do we have any plots whose index is smaller than max place in line? if so then we can sell
  const canSell = Object.keys(plots).some((index) => offer.maxPlaceInLine.minus(new BigNumber(plots[index])).gt(0));
  return (
    <TableRow>
      {/* Place in line */}
      <TableCell className={classes.lucidaStyle}>
        <span>0 — {displayBN(offer.maxPlaceInLine.minus(harvestableIndex))}</span>
        <QuestionModule description={explainer} style={{ marginLeft: 10 }} position="static" />
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
          {/* ({pctSold.toFixed()}%) */}
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
          {/* Sell into this offer */}
          <TableCell align="center">
            <IconButton
              onClick={() => {
                setOffer(offer);
              }}
              disabled={!canSell}
              style={{
                color: canSell ? theme.linkColor : 'lightgray',
              }}
              size="small"
            >
              <ShoppingCartIcon />
            </IconButton>
          </TableCell>
        </>
      ) }
    </TableRow>
  );
}

type OffersProps = {
  mode: 'ALL' | 'MINE';
}

/**
 * Offers ("Offers to Buy")
 */
export default function Offers(props: OffersProps) {
  const classes = useStyles();
  const [walletAddress, setWalletAddress] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const { buyOffers: offers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  // FIXME: can we offload this to the main site initializer?
  useEffect(() => {
    const init = async () => {
      const addr = await GetWalletAddress();
      setWalletAddress(addr);
    };
    init();
  }, []);

  if (offers == null || walletAddress == null) {
    return <div>Loading...</div>;
  }
  if (offers.length === 0) {
    return <div>No offers.</div>;
  }

  const myOffers = offers.filter((offer) => offer.listerAddress === walletAddress);
  const otherOffers = offers.filter((offer) => offer.listerAddress !== walletAddress);

  //
  let content;
  if (props.mode === 'MINE') {
    if (myOffers.length > 0) {
      content = (
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
            {myOffers.map((offer) => <OfferRow key={offer.index} offer={offer} setOffer={setCurrentOffer} isMine />)}
          </Table>
        </TableContainer>
      );
    } else {
      content = (
        <div>
          <h4 style={{ }}>No active bids</h4>
        </div>
      );
    }
  } else {
    content = (
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
                <TableCell align="center">
                  Sell
                </TableCell>
              </TableRow>
            </TableHead>
            {otherOffers.map((offer) => (
              <OfferRow
                key={offer.index}
                offer={offer}
                setOffer={setCurrentOffer}
              />
            ))}
          </Table>
        </TableContainer>
      </>
    );
  }

  return (
    <>
      <SellIntoOfferModal
        currentOffer={currentOffer}
        onClose={() => setCurrentOffer(null)}
      />
      {content}
    </>
  );
}

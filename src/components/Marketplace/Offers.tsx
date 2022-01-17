import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
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
  FilterListRounded as FilterIcon,
} from '@material-ui/icons';

import { theme } from 'constants/index';
import { beanstalkContract, CryptoAsset, displayBN, FarmAsset, GetWalletAddress, TokenImage } from 'util/index';
import SellPlotModal from 'components/Marketplace/SellPlotModal';
import TokenIcon from 'components/Common/TokenIcon';
import { BalanceTableCell, QuestionModule } from 'components/Common';
import { useStyles } from './TableStyles';

function OfferRow({ offer, setOffer, isMine }) {
  const classes = useStyles();
  const numPodsLeft = offer.initialAmountToBuy.minus(offer.amountBought);
  // const pctSold = offer.amountBought.dividedBy(offer.initialAmountToBuy);
  const explainer = `${isMine ? `You want` : `${offer.listerAddress.slice(0, 6)} wants`} to buy ${displayBN(numPodsLeft)} Pods for ${displayBN(offer.pricePerPod)} Beans per Pod anywhere before ${displayBN(offer.maxPlaceInLine)} in the pod line.`;
  return (
    <TableRow>
      {/* Place in line */}
      <TableCell className={classes.lucidaStyle}>
        <span>0 — {displayBN(offer.maxPlaceInLine)}</span>
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
              style={{
                color: theme.linkColor,
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
  mode: "ALL" | "MINE";
}

/**
 * Offers = "Offers to Buy"
 * 
 * FIXME: This really shouldn't be called Offers throughout the Beanstalk app,
 * that word is ambiguous (offer to buy or offer to sell?)
 */
export default function Offers(props: OffersProps) {
  const classes = useStyles();
  const [walletAddress, setWalletAddress] = useState(null);
  const { buyOffers: offers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const [currentOffer, setCurrentOffer] = useState(null);

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
  if (props.mode === "MINE") {
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
            {otherOffers.map((offer) => <OfferRow key={offer.index} offer={offer} setOffer={setCurrentOffer} />)}
          </Table>
        </TableContainer>
      </>
    )
  }

  return (
    <>
      <SellPlotModal
        currentOffer={currentOffer}
        onClose={() => setCurrentOffer(null)}
      />
      {content}
    </>
  );
}

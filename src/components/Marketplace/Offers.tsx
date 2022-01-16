import React, { useEffect, useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from '@material-ui/core';
import { theme, BEAN } from 'constants/index';
import SellPlotModal from 'components/Marketplace/SellPlotModal';
import { beanstalkContract, CryptoAsset, displayBN, FarmAsset, GetWalletAddress, TokenImage } from 'util/index';
import { BalanceTableCell } from 'components/Common';
import { ReactComponent as BeanIcon } from 'img/bean-logo.svg';
import {
  CloseOutlined as CancelIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  FilterListRounded as FilterIcon,
} from '@material-ui/icons';

import { useStyles } from './TableStyles';

function Offer({ offer, setOffer, isMine }) {
  const classes = useStyles();

  const numPodsLeft = offer.initialAmountToBuy.minus(offer.amountBought);
  const pctSold = offer.amountBought.dividedBy(offer.initialAmountToBuy);

  return (
    <TableRow>
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Max place in line"
        balance={offer.maxPlaceInLine}
      />
      <BalanceTableCell
        className={classes.lucidaStyle}
        label="Price per pod"
        balance={offer.pricePerPod}
        icon={<BeanIcon className={classes.beanIcon} />}
      />
      { isMine ? (
        <>
          {/* Amount total amount offered */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Offered"
            balance={offer.initialAmountToBuy}
            icon={<img alt="Pods" src={TokenImage(FarmAsset.Pods)} className={classes.beanIcon} />}
          />
          {/* Amount filled so far */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Sold"
            balance={offer.amountBought}
          > 
            {/* Show the percentage of this offer that has been sold so far. */}
            {displayBN(offer.amountBought)} ({pctSold.toFixed()}%)
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
          {/* # of pods in this offer */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Offered"
            balance={offer.initialAmountToBuy}
            icon={<img alt="Pods" src={TokenImage(FarmAsset.Pods)} className={classes.beanIcon} />}
          >
            {displayBN(offer.initialAmountToBuy)}
          </BalanceTableCell>
          {/* # of pods remaining in this offer */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods Available"
            balance={offer.initialAmountToBuy.minus(offer.amountBought)}
            icon={<img alt="Pods" src={TokenImage(FarmAsset.Pods)} className={classes.beanIcon} />}
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

export default function Offers() {
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

  return (
    <>
      <SellPlotModal
        currentOffer={currentOffer}
        onClose={() => setCurrentOffer(null)}
      />
      {myOffers.length > 0 && (
        <>
          <h2 style={{ marginLeft: 12 }}>Your Offers</h2>
          <TableContainer>
            <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="right">
                    Max place in line
                  </TableCell>
                  <TableCell align="right">
                    Price
                  </TableCell>
                  <TableCell align="right">
                    Pods Offered
                  </TableCell>
                  <TableCell align="right" style={{ width: 100 }}>
                    Pods Sold
                  </TableCell>
                  <TableCell align="center" style={{ width: 60 }}>
                    Cancel
                  </TableCell>
                </TableRow>
              </TableHead>
              {myOffers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} isMine />)}
            </Table>
          </TableContainer>
        </>
      ) }
      <h2 style={{ marginLeft: 12 }}>Offers</h2>
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right">
                Max place in line
              </TableCell>
              <TableCell align="right">
                Price
              </TableCell>
              <TableCell align="right">
                Pods Offered
              </TableCell>
              <TableCell align="right" style={{ width: 100 }}>
                Pods Avail.
              </TableCell>
              <TableCell align="center" style={{ width: 60 }}>
                Sell
              </TableCell>
            </TableRow>
          </TableHead>
          {otherOffers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} />)}
        </Table>
      </TableContainer>
    </>
  );
}

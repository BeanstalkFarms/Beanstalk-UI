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
} from '@material-ui/core';
import SellPlotModal from 'components/Marketplace/SellPlotModal';
import { beanstalkContract, CryptoAsset, displayBN, FarmAsset, GetWalletAddress, TokenImage } from 'util/index';
import { BalanceTableCell } from 'components/Common';
import { ReactComponent as BeanIcon } from 'img/bean-logo.svg';

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
            <Button
              onClick={async () => {
                const beanstalk = beanstalkContract();
                await beanstalk.cancelBuyOffer(offer.index.times(10 ** 6).toString());
              }}
            >
              Cancel
            </Button>
          </TableCell>
        </>
      ) : (
        <>
          {/* # of pods remaining in this offer */}
          <BalanceTableCell
            className={classes.lucidaStyle}
            label="Pods"
            balance={offer.initialAmountToBuy.minus(offer.amountBought)}
            icon={<img alt="Pods" src={TokenImage(FarmAsset.Pods)} className={classes.beanIcon} />}
          >
            {displayBN(numPodsLeft)}
          </BalanceTableCell>
          {/* Sell into this offer */}
          <TableCell align="center">
            <Button
              onClick={() => {
                setOffer(offer);
              }}
            >
              Sell
            </Button>
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
                  <TableCell align="center">
                    Max place in line
                  </TableCell>
                  <TableCell align="center">
                    Price per pod
                  </TableCell>
                  <TableCell align="center">
                    Pods Offered
                  </TableCell>
                  <TableCell align="center">
                    Pods Sold
                  </TableCell>
                  <TableCell align="center" />
                </TableRow>
              </TableHead>
              {myOffers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} isMine />)}
            </Table>
          </TableContainer>
        </>
      ) }
      <h2 style={{ marginLeft: 12 }}>All Offers</h2>
      <TableContainer>
        <Table className={width > 500 ? classes.table : classes.tableSmall} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right">Max place in line</TableCell>
              <TableCell align="right">Price per pod</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Buy</TableCell>
            </TableRow>
          </TableHead>
          {otherOffers.map((offer) => <Offer key={offer.index} offer={offer} setOffer={setCurrentOffer} />)}
        </Table>
      </TableContainer>
    </>
  );
}

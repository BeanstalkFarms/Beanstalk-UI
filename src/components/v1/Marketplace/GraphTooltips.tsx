import React from 'react';
import BigNumber from 'bignumber.js';
import { Button } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { displayBN, displayFullBN, FarmAsset, CryptoAsset } from 'util/index';
import { PodListing, PodOrder } from 'state/marketplace/reducer';
import TokenIcon from 'components/Common/TokenIcon';

const useStyles = makeStyles({
  formButton: {
    borderRadius: '15px',
    fontFamily: 'Futura-Pt-Book',
    margin: '10px 0',
    minWidth: '120px',
    padding: '2px 10px',
  },
  tooltipDetailRow: {
    display: 'flex',
    minWidth: 180,
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '4px 0',
  },
  tooltipDetailPill: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
  },
  boldFont: {
    fontWeight: 'bold'
  },
  centerText: {
    textAlign: 'center'
  }
});

type GraphListingTooltipProps = {
  listing: PodListing;
  harvestableIndex: BigNumber;
  onTransact: (listing: PodListing) => void;
};

export const GraphListingTooltip = (props: GraphListingTooltipProps) => {
  const classes = useStyles();
  const { listing, harvestableIndex, onTransact } = props;

  return (
    <div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Price per pod</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayFullBN(listing.pricePerPod, 3)}
          </span>
          <TokenIcon token={CryptoAsset.Bean} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Plot Size</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(listing.remainingAmount)}
          </span>
          <TokenIcon token={FarmAsset.Pods} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Beans to Fill</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(listing.remainingAmount.times(listing.pricePerPod))}
          </span>
          <TokenIcon token={CryptoAsset.Bean} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Place In Line</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(listing.index.minus(harvestableIndex))}
          </span>
        </div>
      </div>
      <div className={classes.centerText}>
        <Button
          className={classes.formButton}
          color="primary"
          onClick={() => onTransact(listing)}
          variant="contained"
        >
          Buy
        </Button>
      </div>
    </div>
  );
};

type GraphOrderTooltipProps = {
  order: PodOrder;
  // harvestableIndex: BigNumber;
  onTransact: (listing: PodOrder) => void;
};

export const GraphOrderTooltip = (props: GraphOrderTooltipProps) => {
  const classes = useStyles();
  const { order, onTransact } = props;

  return (
    <div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Price per pod</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayFullBN(order.pricePerPod, 2)}
          </span>
          <TokenIcon token={CryptoAsset.Bean} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Pods Ordered</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(order.remainingAmount)}
          </span>
          <TokenIcon token={FarmAsset.Pods} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Beans if Filled</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(order.remainingAmount.times(order.pricePerPod))}
          </span>
          <TokenIcon token={CryptoAsset.Bean} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span className={classes.boldFont}>Max Place In Line</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(order.maxPlaceInLine)}
          </span>
        </div>
      </div>
      <div className={classes.centerText}>
        <Button
          className={classes.formButton}
          color="primary"
          onClick={() => onTransact(order)}
          variant="contained"
        >
          Sell
        </Button>
      </div>
    </div>
  );
};

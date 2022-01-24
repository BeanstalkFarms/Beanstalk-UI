import React from 'react';
import BigNumber from 'bignumber.js';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { displayBN, displayFullBN, FarmAsset, CryptoAsset } from 'util/index';
import { Listing } from 'state/marketplace/reducer';
import TokenIcon from 'components/Common/TokenIcon';

type GraphTooltipProps = {
  listing: Listing;
  harvestableIndex: BigNumber;
  onBuyClick: (listing: Listing) => void;
};

export const GraphTooltip = (props: GraphTooltipProps) => {
  const { listing, harvestableIndex, onBuyClick } = props;

  const classes = makeStyles(() => ({
    formButton: {
      borderRadius: '15px',
      fontFamily: 'Futura-Pt-Book',
      margin: '10px 0',
      minWidth: '120px',
      padding: '2px 10px',
    },
    tooltipDetailRow: {
      display: 'flex',
      minWidth: 150,
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '4px 0',
    },
    tooltipDetailPill: {
      backgroundColor: '#fae4b5',
      borderRadius: 10,
      padding: 5,
    },
  }))();

  return (
    <div>
      <div className={classes.tooltipDetailRow}>
        <span style={{ fontWeight: 'bold' }}>Price per pod</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayFullBN(listing.pricePerPod, 2)}
          </span>
          <TokenIcon token={CryptoAsset.Bean} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span style={{ fontWeight: 'bold' }}>Plot Size</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(listing.initialAmount.minus(listing.amountSold))}
          </span>
          <TokenIcon token={FarmAsset.Pods} />
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span style={{ fontWeight: 'bold' }}>Place In Line</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            {displayBN(listing.objectiveIndex.minus(harvestableIndex))}
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Button
          className={classes.formButton}
          color="primary"
          onClick={() => onBuyClick(listing)}
          variant="contained"
        >
          Buy
        </Button>
      </div>
    </div>
  );
};

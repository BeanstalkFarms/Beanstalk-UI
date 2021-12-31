import React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Listing } from 'state/marketplace/reducer';

type GraphTooltipProps = {
  listing: Listing;
  onBuyClick: (listing: Listing) => void;
};

export const GraphTooltip = (props: GraphTooltipProps) => {
  const { listing, onBuyClick } = props;

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
          <span>${listing.pricePerPod.toFixed(2)}</span>
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span style={{ fontWeight: 'bold' }}>Plot Size</span>
        <div className={classes.tooltipDetailPill}>
          <span>{listing.amountSold.toLocaleString('en-US')}</span>
        </div>
      </div>
      <div className={classes.tooltipDetailRow}>
        <span style={{ fontWeight: 'bold' }}>Total Price</span>
        <div className={classes.tooltipDetailPill}>
          <span>
            $
            {(listing.amountSold * listing.pricePerPod).toLocaleString(
              'en-US',
              { maximumFractionDigits: 2 }
            )}
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

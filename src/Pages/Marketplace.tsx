// @ts-nocheck
import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';

import Updater from '../state/marketplace/updater';

export default function Marketplace() {
  // TODO: hook this up
  const { listings, buyOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  console.log('got listings, buyOffers:', listings, buyOffers);

  return (
    <div style={{ width: '100%', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: 'lightgray', maxWidth: 960, marginTop: 128 }}>
        {/* Listings */}
        <h1 style={{ fontSize: 24 }}>Listings</h1>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
            <p>Seller</p>
            <p>Index</p>
            <p>Price / pod</p>
            <p>Expiry</p>
            <p>Amount</p>
            <p>Status</p>
          </div>
          {listings.map((listing) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
              <p>{listing.listerAddress}</p>
              <p>{listing.objectiveIndex.toString()}</p>
              <p>{listing.pricePerPod.toString()}</p>
              <p>{listing.expiry.toString()}</p>
              <p>{listing.initialAmount.minus(listing.amountSold).toString()}</p>
              <p>{listing.status}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'lightgray', maxWidth: 960, marginTop: 128 }}>
        {/* Offers */}
        <h1 style={{ fontSize: 24 }}>Buy Offers</h1>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
            <p>Buyer</p>
            <p>Amount</p>
            <p>Price / pod</p>
            <p>Max Place in Line</p>
            <p>Status</p>
          </div>
          {buyOffers.map((buyOffer) => (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
              <p>{buyOffer.listerAddress}</p>
              <p>{buyOffer.initialAmountToBuy.minus(buyOffer.amountBought).toString()}</p>
              <p>{buyOffer.pricePerPod.toString()}</p>
              <p>{buyOffer.maxPlaceInLine.toString()}</p>
              <p>{buyOffer.status}</p>
            </div>
          ))}
        </div>
      </div>
      <Updater />
    </div>
  );
}

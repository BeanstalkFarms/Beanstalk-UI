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
    <div style={{ marginTop: 128, width: '100%', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: 'lightgray', maxWidth: 960, marginTop: 128 }}>
        {/* Listings */}
        <h1 style={{ fontSize: 24 }}>Listings</h1>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}>
            <p>Seller</p>
            <p>Seller</p>
            <p>Seller</p>
            <p>Seller</p>
            <p>Seller</p>
            <p>Seller</p>
          </div>
          {listings.map((listing) => (
            <div>
              <p>{JSON.stringify(listing)}</p>
            </div>
          ))}
        </div>
      </div>
      <Updater />
    </div>
  );
}

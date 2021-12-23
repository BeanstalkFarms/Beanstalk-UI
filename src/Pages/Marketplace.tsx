// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { displayBN } from 'util/index';

import Updater from '../state/marketplace/updater';

export default function Marketplace() {
  // TODO: hook this up
  const { listings, buyOffers } = useSelector<AppState, AppState['marketplace']>(
    (state) => state.marketplace
  );
  const { harvestableIndex } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);
  /*
  const {
    // beanBalance,
    // ethBalance,
    // lpReceivableBalance,
    // beanClaimableBalance,
    // beanReceivableBalance,
    // claimable,
    // claimableEthBalance,
    // harvestablePodBalance,
    // hasClaimable,
    plots,
    // harvestablePlots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
   */
  const plots = {
    10000000: 185799,
  };

  console.log('got listings, buyOffers:', listings, buyOffers);
  console.log('got plots:', plots);

  console.log(harvestableIndex);
  const hasPlots = Object.keys(plots).length > 0;
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
      { hasPlots && (
        <div style={{ background: 'lightgray', maxWidth: 960, marginTop: 64 }}>
          {/* Your plots */}
          <h1 style={{ fontSize: 24 }}>Sell your plots</h1>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <p>Place in Line</p>
              <p>Pods</p>
              <div />
            </div>
            {Object.keys(plots)
              .sort((a, b) => a - b)
              .map((index) => (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <p>{displayBN(harvestableIndex.minus(index))}</p>
                  <p>{plots[index]}</p>
                  <button type="button">List for sale</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div style={{ background: 'lightgray', maxWidth: 960, marginTop: 64 }}>
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

// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { displayBN } from 'util/index';
import Modal from '@mui/material/Modal';

import TabbedMarketplace from '../components/Marketplace/TabbedMarketplace';
import Updater from '../state/marketplace/updater';

/*
 * TODO:
 * 1.
 * - Need to show your current plot listings and be able to cancel them.
 *   - Need to filter these out of all listings + your plots to sell
 * - Be able to create a buy offer
 *   - Be able to show current buy offers and cancel them
 *   - Filter them out of global buy offers too
 *
 * 2. Figure out better UI for this
 *    - Hook it up with better logic for default/min/max values
 *    - Also hook it up with metamask eth balance, etc
 *
 * 3. Hook it up to actual contract events
 */

function SellPlotModal({
  plotIndex,
  maxPods,
  onClose,
}) {
  const [amount, setAmount] = useState(maxPods);
  const [pricePerPod, setPricePerPod] = useState(1);
  const [expiry, setExpiry] = useState(1000000);
  const onClick = () => {
    // TODO: list plot for sale
    console.log('List plot for sale:', plotIndex, pricePerPod, expiry, amount);
    onClose();
  };
  return (
    <Modal
      open={plotIndex != null}
      onClose={onClose}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2>List your plot for sale</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p>Max number of pods: {maxPods}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>Amount to sell</p>
            <input
              type="number"
              value={amount}
              max={maxPods}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>Price per pod</p>
            <input type="number" value={pricePerPod} onChange={(e) => setPricePerPod(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p>Expires in</p>
            <input type="number" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <button type="button" style={{ marginTop: 12 }} onClick={onClick}>Submit</button>
        </div>
      </Box>
    </Modal>
  );
}

export default function Marketplace() {
  const [plotToSell, setPlotToSell] = useState(null);
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

  const hasPlots = Object.keys(plots).length > 0;
  return (
    <Box style={{ paddingTop: 150 }}>
      <TabbedMarketplace />
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
                    <button
                      type="button"
                      onClick={() => setPlotToSell(index)}
                    >
                      List for sale
                    </button>
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
        {plotToSell && (
          <SellPlotModal
            plotIndex={plotToSell}
            maxPods={plots && plots[plotToSell]}
            onClose={() => setPlotToSell(null)}
          />
        )}
        <Updater />
      </div>
    </Box>
  );
}

// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { displayBN } from 'util/index';

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
    <div style={{ paddingTop: 150 }}>
      <TabbedMarketplace />
      <Updater />
    </div>
  );
}

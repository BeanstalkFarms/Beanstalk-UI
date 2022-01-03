// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';

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
  return (
    <div>
      <TabbedMarketplace />
      <Updater />
    </div>
  );
}

// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React from 'react';

import TabbedMarketplace from '../components/Marketplace/TabbedMarketplace';
import Updater from '../state/marketplace/updater';

export default function Marketplace() {
  return (
    <div>
      <TabbedMarketplace />
      <Updater />
    </div>
  );
}

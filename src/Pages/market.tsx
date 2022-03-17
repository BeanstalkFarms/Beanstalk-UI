// @ts-nocheck
import React from 'react';
import Page from 'components/Page';
import Marketplace from 'components/Marketplace';
import MarketplaceUpdater from 'state/marketplace/updater';

export default function MarketPage() {
  return (
    <Page title="Market">
      <MarketplaceUpdater />
      <Marketplace />
    </Page>
  );
}

// @ts-nocheck
import React from 'react';

import { Page } from 'pages/index';
import Marketplace from 'components/Marketplace';
import Updater from 'state/marketplace/updater';

export default function MarketPage() {
  const sectionTitles = ['Market'];
  const sections = [<Marketplace />];

  return (
    <>
      <Page
        sections={sections}
        sectionTitles={sectionTitles}
      />
      <Updater />
    </>
  );
}

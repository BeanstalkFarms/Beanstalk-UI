// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React from 'react';
import { Page } from 'Pages/index';
import Marketplace from '../components/Marketplace';
import Updater from '../state/marketplace/updater';

export default function MarketplacePage() {
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

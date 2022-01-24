// @ts-nocheck
// import BigNumber from 'bignumber.js';
import React from 'react';
import { Page } from 'Pages/index';
import TabbedMarketplace from '../components/Marketplace/TabbedMarketplace';
import Updater from '../state/marketplace/updater';

export default function Marketplace() {
  const sectionTitles = ['Market'];
  const sections = [<TabbedMarketplace />];

  return (
    <>
      <Page
        sections={sections}
        sectionTitles={sectionTitles}
        hideTitles
      />
      <Updater />
    </>
  );
}
